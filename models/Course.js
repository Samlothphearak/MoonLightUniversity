const mongoose = require("mongoose");

// Define the Course schema
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
  instructor: {
    type: String,
    required: true,
    trim: true,
  },
  schedule: [
    {
      day: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
  ], // Array to store the schedule (e.g., "Monday, 10:00 AM")
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Course model
const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
