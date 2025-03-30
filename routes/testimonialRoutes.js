const express = require('express');
const router = express.Router();
const Testimonial = require('../models/testimonial');

// Get all approved testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new testimonial
router.post('/testimonials', async (req, res) => {
  const testimonial = new Testimonial({
    text: req.body.text,
    rating: req.body.rating,
    author: req.body.author || 'Anonymous'
  });

  try {
    const newTestimonial = await testimonial.save();
    res.status(201).json(newTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin route to approve testimonials
router.patch('/testimonials/:id/approve', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    
    testimonial.approved = true;
    const updatedTestimonial = await testimonial.save();
    res.json(updatedTestimonial);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;