const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  presentationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Presentation',
    required: true,
    index: true
  },
  topicNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'selected'],
    default: 'available',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Topic', topicSchema);
