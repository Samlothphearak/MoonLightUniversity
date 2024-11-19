const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const News = require("./models/News");
const Admin = require('./models/Admin'); // Adjust the path if needed
const multer = require("multer");
const path = require("path");
const session = require('express-session');
const nodemailer = require('nodemailer');
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
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

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

// MongoDB Schema & Model
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Invalid email format"], // Basic email validation
  },
  department: {
    type: String,
    required: true,
  },
});

const Student = mongoose.model("Student", studentSchema);

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

// Add Student - Render Form
app.get("/add-student", (req, res) => {
  res.render("add-student"); // Render form to add a student
});

// Add Student - Handle Form Submission
app.post("/add-student", async (req, res) => {
  const { name, email, department } = req.body;
  if (!name || !email || !department) {
    return res.status(400).send("All fields are required");
  }
  try {
    await Student.create({ name, email, department });
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error adding student");
  }
});

// Delete Student
app.post("/delete-student/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect("/");
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
      adminName: req.session.adminName,  // Add adminName from session
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
app.get('/admin-login', (req, res) => {
    res.render('admin-login', { errorMessage: null });
});

// Admin login form submission (POST)
app.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;

  // Find admin by username
  const admin = await Admin.findOne({ username });
  if (!admin) {
      return res.render('admin-login', { errorMessage: 'Invalid username or password' });
  }

  // Compare the entered password with the stored password
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
      return res.render('admin-login', { errorMessage: 'Invalid username or password' });
  }

  // Store the admin in the session after successful login
  req.session.isAuthenticated = true;
  req.session.adminName = admin.adminName;  // Store admin name in session

  // Redirect to the admin dashboard
  res.redirect('/admin');
});

// Admin dashboard route (GET)
app.get('/admin', (req, res) => {
    if (req.session.isAuthenticated) {
        res.render('admin-dashboard', { adminName: req.session.adminName });
    } else {
        res.redirect('/admin-login');
    }
});

// Add Admin Route (POST)
app.post('/add-admin', async (req, res) => {
    const { username, password, adminName } = req.body;

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
        return res.status(400).send('Admin with that username already exists!');
    }

    try {
        const newAdmin = new Admin({
            username,
            password,
            adminName,
        });

        await newAdmin.save();
        res.status(201).send('Admin created successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating admin.');
    }
});
// Admin creation form (GET)
app.get('/add-admin', (req, res) => {
  res.render('add-admin');
});

// ===============Admin dashboard route (GET)====================
// Admin dashboard route (GET)
app.get('/admin', async (req, res) => {
  if (req.session.isAuthenticated) {
      try {
          // Fetch data from the database
          const totalArticles = await News.countDocuments();
          const pendingApprovals = await News.countDocuments({ status: 'pending' });
          const expiredArticles = await News.countDocuments({ status: 'expired' });

          // Fetch recent activity (last 5 added news articles)
          const recentActivity = await News.find().sort({ createdAt: -1 }).limit(5);

          // Render the dashboard with data
          res.render('admin-dashboard', {
              adminName: req.session.adminName,  // Pass the admin's name
              totalArticles,                  // Pass the variable for total articles
              pendingApprovals,               // Pass the variable for pending approvals
              expiredArticles,               // Pass the variable for expired articles
              recentActivity,                // Pass the variable for recent activity
          });
      } catch (error) {
          console.error('Error fetching dashboard data:', error);
          res.status(500).send('Error fetching dashboard data');
      }
  } else {
      res.redirect('/admin-login'); // Redirect to login page if not authenticated
  }
});

// ==================Route to render the "Contact Us" form (GET)===================
app.get('/contact', (req, res) => {
  res.render('contact'); // Renders the 'contact.ejs' file
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
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error(err);
          return res.redirect('/admin');
      }
      res.redirect('/admin-login'); // Redirect to login page after logout
  });
});
// Start Server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
