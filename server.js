const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const News = require("./models/News");
const Admin = require("./models/Admin");
const Student = require("./models/Student");
const Notification = require("./models/Notification"); // Adjust the path as needed
const Course = require("./models/Course"); // Your course model
const Schedule = require("./models/Schedule");
const multer = require("multer");
const path = require("path");
const session = require("express-session");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;

// Configure Multer storage options
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder where the file will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique file names
  },
});

// File filter (only accept images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only images are allowed!"), false);
  }
};

// Set up session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Set up multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});
//===========Use body-parser to parse form data=============
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images statically
// Middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));
// Route for rendering the main university page
app.get("/", async (req, res) => {
  try {
    const currentDate = new Date();

    // Fetch news articles from the database where the expiration date is either not set
    // or in the future (greater than the current date)
    const newsArticles = await News.find({
      $or: [
        { expiredAt: { $gt: currentDate } }, // ExpiredAt is in the future
        { expiredAt: { $exists: false } }, // No expiration date set
      ],
    }).sort({ date: -1 }); // Sort news articles by most recent

    res.render("welcome", { newsArticles }); // Pass `newsArticles` to the EJS template
  } catch (error) {
    console.error("Error fetching news articles:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Routes
// Home - View All Students
app.get("/index", async (req, res) => {
  try {
    const students = await Student.find();
    res.render("index", { students });
  } catch (err) {
    res.status(500).send("Error fetching students");
  }
});

// GET Add Student Page
// Route to display the form (GET)
app.get("/add-student", (req, res) => {
  res.render("add-student", { error: null, success: null });
});

// Route to handle form submission (POST)
app.post("/add-student", upload.single("photo"), async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    dateOfBirth,
    placeOfBirth,
  } = req.body;
  const photo = req.file ? req.file.path : null;

  // Validate form fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !address ||
    !dateOfBirth ||
    !placeOfBirth ||
    !photo
  ) {
    return res.render("add-student", {
      error: "All fields are required!",
      success: null,
    });
  }

  // Validate phone number (e.g., must be 9 digits for Cambodia)
  const phoneRegex = /^[0-9]{9}$/; // Adjust the pattern as needed for your case
  if (!phoneRegex.test(phone)) {
    return res.render("add-student", {
      error: "Phone number must be 9 digits.",
      success: null,
    });
  }

  // Generate a random Student ID (e.g., "S123456")
  const studentID = 'S' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

  // Create a new student document
  try {
    const student = new Student({
      studentID,         // Assign the randomly generated student ID
      firstName,
      lastName,
      email,
      phone,
      address,
      photo,
      dateOfBirth,
      placeOfBirth,
    });

    // Save the student document to the database
    await student.save();

    // Render the form with a success message
    res.render("add-student", {
      error: null,
      success: `Student added successfully! Student ID: ${studentID}`, // Display the Student ID
    });
  } catch (err) {
    console.error(err);
    res.render("add-student", {
      error: "Error adding student. Please try again.",
      success: null,
    });
  }
});


// Delete Student
app.post("/delete-student/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect("/smsd");
  } catch (err) {
    res.status(500).send("Error deleting student");
  }
});

// Edit Student - Render Form for Editing
app.get("/edit-student/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send("Student not found");
    res.render("edit-student", { student });
  } catch (err) {
    res.status(500).send("Error fetching student for edit");
  }
});

// Edit Student - Handle Form Submission
app.post("/edit-student/:id", async (req, res) => {
  const { name, email, department } = req.body;
  if (!name || !email || !department) {
    return res.status(400).send("All fields are required");
  }
  try {
    await Student.findByIdAndUpdate(req.params.id, { name, email, department });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error updating student");
  }
});
//============= News-Sections =================
app.get("/add-news", (req, res) => {
  // Check if the admin is authenticated
  if (req.session.isAuthenticated) {
    // Render the add-news page with the admin's name from the session
    res.render("add-news", {
      adminName: req.session.adminName, // Add adminName from session
      successMessage: null,
      errorMessage: null,
    });
  } else {
    // Redirect to login if the admin is not authenticated
    res.redirect("/admin-login");
  }
});

app.post("/news/add", upload.single("imageFile"), async (req, res) => {
  const { title, description, imageUrl, author, date, expiredAt } = req.body;

  // If an image file is uploaded, store the file path in `imageUrl`
  const imageFile = req.file ? "/uploads/" + req.file.filename : imageUrl;

  // Save news to database
  try {
    await News.create({
      title,
      description,
      imageUrl: imageFile,
      author,
      date,
      expiredAt: expiredAt ? new Date(expiredAt) : null,
    });
    res.render("add-news", {
      successMessage: "News article added successfully!",
      errorMessage: null,
    });
  } catch (error) {
    console.error(error);
    res.render("add-news", {
      successMessage: null,
      errorMessage: "Error adding news article",
    });
  }
});

// ===============Admin login page================== (GET)
// Admin login route (GET)
app.get("/admin-login", (req, res) => {
  res.render("admin-login", { errorMessage: null });
});

// Admin login form submission (POST)
app.post("/admin-login", async (req, res) => {
  const { username, password } = req.body;

  // Find admin by username
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.render("admin-login", {
      errorMessage: "Invalid username or password",
    });
  }

  // Compare the entered password with the stored password
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    return res.render("admin-login", {
      errorMessage: "Invalid username or password",
    });
  }

  // Store the admin in the session after successful login
  req.session.isAuthenticated = true;
  req.session.adminName = admin.adminName; // Store admin name in session

  // Redirect to the admin dashboard
  res.redirect("/admin");
});

// Admin dashboard route (GET)
app.get("/admin", (req, res) => {
  if (req.session.isAuthenticated) {
    res.render("admin-dashboard", { adminName: req.session.adminName });
  } else {
    res.redirect("/admin-login");
  }
});

// Add Admin Route (POST)
app.post("/add-admin", async (req, res) => {
  const { username, password, adminName } = req.body;

  // Check if the admin already exists
  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) {
    return res.status(400).send("Admin with that username already exists!");
  }

  try {
    const newAdmin = new Admin({
      username,
      password,
      adminName,
    });

    await newAdmin.save();
    res.status(201).send("Admin created successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating admin.");
  }
});
// Admin creation form (GET)
app.get("/add-admin", (req, res) => {
  res.render("add-admin");
});

// ===============Admin dashboard route (GET)====================
// Admin dashboard route (GET)
app.get("/admin", async (req, res) => {
  if (req.session.isAuthenticated) {
    try {
      // Fetch data from the database
      const totalArticles = await News.countDocuments();
      const pendingApprovals = await News.countDocuments({ status: "pending" });
      const expiredArticles = await News.countDocuments({ status: "expired" });

      // Fetch recent activity (last 5 added news articles)
      const recentActivity = await News.find().sort({ createdAt: -1 }).limit(5);

      // Render the dashboard with data
      res.render("admin-dashboard", {
        adminName: req.session.adminName, // Pass the admin's name
        totalArticles, // Pass the variable for total articles
        pendingApprovals, // Pass the variable for pending approvals
        expiredArticles, // Pass the variable for expired articles
        recentActivity, // Pass the variable for recent activity
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).send("Error fetching dashboard data");
    }
  } else {
    res.redirect("/admin-login"); // Redirect to login page if not authenticated
  }
});

// ==================Route to render the "Contact Us" form (GET)===================
app.get("/contact", (req, res) => {
  res.render("contact"); // Renders the 'contact.ejs' file
});

// // Route to handle the form submission (POST)
// app.post('/contact', async (req, res) => {
//   const { name, email, message } = req.body;

//   // Example of sending an email or processing the message (logging to console here)
//   console.log('Contact form submitted');
//   console.log('Name:', name);
//   console.log('Email:', email);
//   console.log('Message:', message);

//   // Send an email using Nodemailer (or save to DB, depending on your use case)
//   // For now, we'll render the success message after submission

//   res.render('contact', { successMessage: 'Thank you for contacting us! We will get back to you soon.' });
// });
//===========================
app.get("/smsd", async (req, res) => {
  const students = await Student.find(); // Fetch students from MongoDB
  res.render("smsd", { students });
});
//=========== LogOut================
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/admin");
    }
    res.redirect("/admin-login"); // Redirect to login page after logout
  });
});
//============= student-dashboard ================================
app.get("/student-dashboard", async (req, res) => {
  try {
    const student = await Student.findOne(); // Fetch a single student (for example, the logged-in user)
    res.render("student-dashboard", { student }); // Pass the student object to the template
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).send("Server Error");
  }
});
//==================Edit-profile==============================================
// Route to render the Edit Profile page
app.get('/edit-profile', async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.redirect('/login'); // Redirect to login if no session
    }
    const student = await Student.findById(req.session.studentId);
    res.render('edit-profile', { student });
  } catch (err) {
    res.status(500).send("Error retrieving student profile.");
  }
});

// Route to handle the form submission
app.post('/update-profile', upload.single('photo'), async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.redirect('/login'); // Redirect to login if no session
    }
    const student = await Student.findById(req.session.studentId);

    // Update student fields
    student.firstName = req.body.firstName;
    student.lastName = req.body.lastName;
    student.phone = req.body.phone;
    student.dateOfBirth = req.body.dateOfBirth;
    student.address = req.body.address;

    // If a new profile photo is uploaded, update the photo field
    if (req.file) {
      student.photo = '/public/images/' + req.file.filename;
    }

    await student.save();

    res.redirect('/profile'); // Redirect to profile page after update
  } catch (err) {
    res.status(500).send("Error updating profile.");
  }
});

// Route to render the Profile page (view profile)
app.get('/profile', async (req, res) => {
  try {
    if (!req.session.studentId) {
      return res.redirect('/login'); // Redirect to login if no session
    }
    const student = await Student.findById(req.session.studentId);
    res.render('profile', { student });
  } catch (err) {
    res.status(500).send("Error retrieving student profile.");
  }
});
// ==============Start Server===========================
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
