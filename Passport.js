// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Student = require('../models/student');

passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        const student = await Student.findOne({ email });
        if (!student) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        const isMatch = await student.comparePassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, student);
    }
));

passport.serializeUser((student, done) => {
    done(null, student.id);
});

passport.deserializeUser(async (id, done) => {
    const student = await Student.findById(id);
    done(null, student);
});
