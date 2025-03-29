const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Report = require('../models/Report');
const authenticateToken = require('../middleware/authenticateToken');
const { body, validationResult } = require('express-validator');
const sanitizeFilename = require('sanitize-filename');
const { put } = require('@vercel/blob'); // Vercel Blob Storage

// Configure multer with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  }
});

// Helper function to upload to Vercel Blob
const uploadToBlob = async (fileBuffer, fileName, contentType) => {
  try {
    const blob = await put(fileName, fileBuffer, {
      access: 'public',
      contentType: contentType
    });
    return blob.url;
  } catch (err) {
    console.error('Blob upload error:', err);
    throw new Error('Failed to upload file to storage');
  }
};

// Submit a crime report
router.post(
  '/',
  (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) req.user = user;
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
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { crimeType, location, description, isAnonymous } = req.body;

      // Process files if they exist
      let fileUrls = [];
      if (req.files && req.files.length > 0) {
        fileUrls = await Promise.all(
          req.files.map(async (file) => ({
            url: await uploadToBlob(
              file.buffer,
              `${Date.now()}-${sanitizeFilename(file.originalname)}`,
              file.mimetype
            ),
            originalName: sanitizeFilename(file.originalname)
          }))
        );
      }

      const report = new Report({
        crimeType,
        location,
        description,
        isAnonymous: isAnonymous === 'true',
        files: fileUrls,
        userId: req.user?.userId || null,
      });

      await report.save();
      res.status(201).json({ referenceNumber: report.referenceNumber });
    } catch (error) {
      console.error('Report submission error:', error);
      res.status(500).json({ 
        error: 'Error submitting report',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
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