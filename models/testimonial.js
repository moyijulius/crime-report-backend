const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  author: {
    type: String,
    default: 'Anonymous'
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
module.exports = Testimonial;