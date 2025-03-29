const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  crimeType: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  files: [{ 
    path: { type: String },
    originalName: { type: String }
  }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  messages: [{
    text: String,
    sender: String,
    timestamp: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['Under Review', 'In Progress', 'Investigation', 'Closed'],
    default: 'Under Review' 
  },
  incidentDate: { type: Date, default: Date.now },
  referenceNumber: { 
    type: String,
    unique: true,
    default: function() {
      return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Report', reportSchema);