const mongoose = require("mongoose");

// Define the Notification schema
const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false, // To track if the notification has been read
  },
});

// Define the Student schema
const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{9}$/.test(v); // Adjusted for 9 digits
      },
      message: 'Phone number must contain exactly 9 digits.',
    },
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  photo: {
    type: String, // Store the file path or URL of the uploaded photo
    default: "/public/images/default-photo.jpg",
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  placeOfBirth: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  courses: [String], // Example of enrolled courses
  notifications: [notificationSchema], // Embedded notifications schema
});

// Virtual for student's age based on dateOfBirth
studentSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  if (month < birthDate.getMonth() || (month === birthDate.getMonth() && day < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Create the Student model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;