// routes/student.js
const express = require('express');
const router = express.Router();

// Middleware to ensure user is logged in
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Dashboard route
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { student: req.user });
});

module.exports = router;
