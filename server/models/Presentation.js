const mongoose = require('mongoose');

const presentationSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    trim: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  presentationDate: {
    type: String,
    required: true,
    trim: true
  },
  numberOfTopics: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'locked'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Presentation', presentationSchema);
