const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require("moment"); // For date formatting

// Define the Notification schema
const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title is mandatory
  },
  message: {
    type: String,
    required: true, // Message content
  },
  date: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  isRead: {
    type: Boolean,
    default: false, // Default to unread notifications
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
    enum: ['ADI3', 'ADI4', 'ASI3', 'ASI4', 'ASI13', 'ASI14', 'ASI23', 'ASI24'],
    required: true,
  },
  password: {
    type: String,
    required: true,
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
      ref: "/models/Course.js", // Reference to the Course model
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

// Pre-save middleware to hash the password
// studentSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next(); // Only hash if password is modified

//   try {
//     const salt = await bcrypt.genSalt(10); // Generate a salt
//     this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
//     next(); // Proceed with saving
//   } catch (err) {
//     next(err); // Pass errors to the next middleware
//   }
// });


// Add a welcome notification on new student creation
studentSchema.pre("save", function (next) {
  if (this.isNew) {
    this.notifications.push({
      title: "Welcome to the platform!",
      message: `Hi ${this.firstName} ${this.lastName}, welcome to our learning management system.`,
    });
  }
  next();
});


// Create the Student model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;