const mongoose = require("mongoose");
const moment = require("moment"); // We use Moment.js to format the date

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
  password: {
    type: String,
    required: true,
    // Ideally, password should be hashed for security
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
        return /^[0-9]{9}$/.test(v); // Validate for 9 digits
      },
      message: "Phone number must contain exactly 9 digits.",
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
  ], // Array to store references to courses
  notifications: [notificationSchema], // Embedded notifications
});

// Virtual for student's age
studentSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();
  if (
    month < birthDate.getMonth() ||
    (month === birthDate.getMonth() && day < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Virtual for formatted dateOfBirth
studentSchema.virtual("formattedDateOfBirth").get(function () {
  return moment(this.dateOfBirth).format("D MMMM, YYYY"); // Format like "November 23, 2024"
});

// Create the Student model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
