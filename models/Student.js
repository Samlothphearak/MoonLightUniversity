const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require("moment"); // Moment.js for date formatting

// Define the Notification schema
const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100, // Max length for the title
  },
  message: {
    type: String,
    required: true, // The content of the notification
  },
  type: {
    type: String,
    enum: ["success", "error", "info", "warning"],
    default: "info", // Default type is 'info'
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

// Define the Student schema
const studentSchema = new mongoose.Schema({
  studentID: {
    type: String,
    required: true,
    unique: true,
  },
  group: {
    type: String,
    enum: ["ADI3", "ADI4", "ASI3", "ASI4", "ASI13", "ASI14", "ASI23", "ASI24"],
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Enforce minimum password length
  },
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
        return /^(0|\+855)[0-9]{8,9}$/.test(v); // Validates Cambodian phone numbers
      },
      message: "Phone number must contain exactly 9 digits or start with +855.",
    },
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  photo: {
    type: String,
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
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Reference to the Course model
    },
  ],
  notifications: [notificationSchema], // Embedded notifications
});

// Virtual for student's age
studentSchema.virtual("age").get(function () {
  return moment().diff(moment(this.dateOfBirth), "years"); // Using Moment.js for age calculation
});

// Virtual for formatted dateOfBirth
studentSchema.virtual("formattedDateOfBirth").get(function () {
  return moment(this.dateOfBirth).format("D MMMM, YYYY"); // Format like "23 November, 2024"
});

// Pre-save hook to hash the password before saving
studentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10); // Hashing the password
  }
  next();
});

// Method to compare passwords
studentSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password); // Compare provided password with the hashed one
};

// Create the Student model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
