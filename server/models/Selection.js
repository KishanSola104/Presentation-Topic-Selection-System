const mongoose = require('mongoose');

const selectionSchema = new mongoose.Schema({
  presentationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Presentation',
    required: true,
    index: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    unique: true // A topic can only be selected once
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  selectedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// A student cannot select more than one topic for the same presentation
selectionSchema.index({ presentationId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Selection', selectionSchema);
