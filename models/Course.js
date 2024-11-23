const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: String,
    required: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;