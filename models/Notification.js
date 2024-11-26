const mongoose = require("mongoose");

// Define the Notification schema
const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
  },
  recipients: {
    type: [String], // Array of student IDs
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['success', 'info', 'warning'],
    default: 'info',  // Default to 'info' if no type is specified
  }
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;