const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Report = require('../models/Report');
const authenticateToken = require('../middleware/authenticateToken');
const { body, validationResult } = require('express-validator');
const sanitizeFilename = require('sanitize-filename');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });



// Submit a crime report - with optional authentication
router.post(
  '/',
  (req, res, next) => {
    // Try to authenticate but don't require it
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) {
          req.user = user;
        }
        next();
      });
    } else {
      next();
    }
  },
  upload.array('files'),
  [
    body('crimeType').notEmpty().withMessage('Crime type is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }

    const { crimeType, location, description, isAnonymous } = req.body;

    const files = req.files ? req.files.map((file) => ({
      path: file.path,
      originalName: sanitizeFilename(file.originalname),

    })) : [];

    try {
      const report = new Report({
        crimeType,
        location,
        description,
        isAnonymous: isAnonymous === 'true',
        files,
        userId: req.user ? req.user.userId : null,
      });

      await report.save();
     
      res.status(201).json({ referenceNumber: report.referenceNumber });
    } catch (error) {
    
      res.status(500).json({ error: 'Error submitting report', details: error.message });
    }
  }
);
// Get all reports for the logged-in user
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ error: 'Error fetching reports' });
  }
});

// Delete a report
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    // Check if report exists
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if user owns this report
    if (report.userId && report.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this report' });
    }
    
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Error deleting report' });
  }
});

// Fetch case details by reference number
router.get('/:referenceNumber', async (req, res) => {
  try {
    const report = await Report.findOne({ 
      referenceNumber: req.params.referenceNumber.trim().toUpperCase() 
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching case details:', error);
    res.status(500).json({ error: 'Error fetching case details' });
  }
});
// Fetch all reports (for officers)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reports' });
  }
});

// Add messages to a report
router.post('/:referenceNumber/messages', async (req, res) => {
  try {
    const report = await Report.findOne({ referenceNumber: req.params.referenceNumber });
    if (!report) {
      return res.status(404).json({ error: 'Case not found' });
    }
    
    const message = {
      text: req.body.message,
      sender: req.body.sender,
      timestamp: new Date()
    };
    
    report.messages.push(message);
    await report.save();
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error adding message' });
  }
});


module.exports = router;