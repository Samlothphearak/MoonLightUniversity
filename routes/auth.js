// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const Student = require('../models/Student');

// Signup route
router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, phone, password, dateOfBirth } = req.body;

    try {
        const newStudent = new Student({ firstName, lastName, email, phone, password, dateOfBirth });
        await newStudent.save();
        req.flash('success', 'Registration successful. Please log in.');
        res.redirect('/login');
    } catch (err) {
        req.flash('error', 'Error registering student.');
        res.redirect('/signup');
    }
});

// Login route
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
}));

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
