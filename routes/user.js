const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');


router.get('/signup', (req, res) => {
    res.render('users/signup.ejs');
});

router.post('/signup', async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', `Welcome to Wanderlust, ${username}!`);
            res.redirect('/listings');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
});

//login routes
router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post('/login',
    // 1. This middleware runs first, saving the intended URL if it exists.
    saveRedirectUrl,
    
    // 2. Passport attempts to authenticate the user.
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureFlash: true 
    }),
    
    // 3. This handler only runs on successful login.
    (req, res) => {
        req.flash('success', 'Welcome back!');
        // Redirect to the saved URL, or default to /listings if no URL was saved.
        const redirectUrl = res.locals.redirectUrl || '/listings';
        res.redirect(redirectUrl);
    }
);




router.get('/logout', (req, res, next) => {
    // req.logout() is a Passport function that requires a callback
    req.logout((err) => {
        if (err) {
            // If there's an error during logout, pass it to the error handler
            return next(err);
        }
        // Flash a success message
        req.flash('success', 'You have been logged out.');
        // Redirect to the listings page
        res.redirect('/listings');
    });
});
module.exports = router;