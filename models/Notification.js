const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Add title for the notification
  message: { type: String, required: true },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: false  // Make this optional since notifications can be sent to all students
  },
  recipientType: {
    type: String,
    enum: ['all', 'specific'], // Type of recipient (either all students or specific)
    required: true
  },
  date: { type: Date, default: Date.now },
});

// Create a Notification model
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;