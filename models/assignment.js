const mongoose = require('mongoose');

// Define the Assignment Schema
const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,  // Optional field
  },
  due_date: {
    type: Date,
    required: true,
  },
  file: {
    type: String,  // Store the file path if an attachment is uploaded
    required: false,  // Optional field
  },
  created_at: {
    type: Date,
    default: Date.now,  // Timestamp for when the assignment was created
  },
});

// Create the Assignment model
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
