const mongoose = require('mongoose');

const studentItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

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
  groupType: {
    type: String,
    enum: ['solo', 'duo', 'trio'],
    default: 'solo'
  },
  students: {
    type: [studentItemSchema],
    default: []
  },
  studentIds: {
    type: [String],
    index: true,
    default: []
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

// Indexes for fast duplicate check
selectionSchema.index({ presentationId: 1, studentId: 1 });
selectionSchema.index({ presentationId: 1, studentIds: 1 });

module.exports = mongoose.model('Selection', selectionSchema);
