const express = require('express');
const router = express.Router();
const Testimonial = require('../models/testimonial');
const User = require('../models/User');
const Report = require('../models/Report');
const authenticateToken = require('../middleware/authenticateToken');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// Middleware to ensure only admins can access these routes
router.use(authenticateToken, authenticateAdmin);
// TESTIMONIALS ROUTES
// Get all testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching testimonials' });
  }
});

// Approve or Reject Testimonial
router.put('/testimonials/:id', async (req, res) => { 
  try {
    const { approved } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: 'Error updating testimonial' });
  }
});

// Delete Testimonial
router.delete('/testimonials/:id', async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting testimonial' });
  }
});

// USERS ROUTES
// Get all users
router.get('/users', async (req, res) => {
  try {
    // Exclude password field for security
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// Get users by role
router.get('/users/role/:role', async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users by role' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, phone, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, phone, role },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

// REPORTS ROUTES
// Get all reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching reports' });
  }
});

// Update report status
router.put('/reports/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error updating report' });
  }
});

// Delete report
router.delete('/reports/:id', async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting report' });
  }
});

// Add admin message to report
router.post('/reports/:id/messages', async (req, res) => {
  try {
    const { message } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    report.messages.push({
      text: message,
      sender: 'admin',
      timestamp: new Date()
    });
    
    await report.save();
    res.status(201).json(report.messages[report.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ error: 'Error adding message to report' });
  }
});

module.exports = router;