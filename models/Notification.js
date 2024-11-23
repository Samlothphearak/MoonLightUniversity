const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    recipients: {
      type: [String], // List of recipient identifiers, e.g., group names (e.g., 'ADI3', 'ASI4')
      required: true,
    },
    // Store the reference to the student who received the notification
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    date: {
      type: Date,
      default: Date.now, // Automatically set the notification date to the current time
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the model for notifications
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;