require('dotenv').config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session"); 
const MongoStore = require('connect-mongo'); // 1. Require connect-mongo
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// --- Routers ---
const listingRouter = require("./routes/listing.js");
const reviewRouter = require('./routes/review.js');
const userRouter = require("./routes/user.js");

// --- Database Connection ---
const dbUrl = process.env.ATLASDB_URL;
const secret = process.env.SECRET;



main()
    .then(() => {
        console.log("Database connected successfully.");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

// --- App Configuration & Middleware ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));

// 2. Configure MongoStore
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret ,
    },
    touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", (err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

// --- Session and Authentication Configuration ---
const sessionOptions = {
    store, // 3. Use the configured MongoStore
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
};

// IMPORTANT: Session must be configured BEFORE Passport
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Configure Passport to use the LocalStrategy with the User model
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// --- Global Middleware to Pass Data to All Templates ---
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user; // Provides user info to all templates
    next();
});


// --- Routes ---
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);


// --- Root Redirect ---
app.get("/", (req, res) => {
    res.redirect("/listings");
});


// --- Server Start ---
app.listen(5000, () => {
    console.log("Server has started on port 5000");
});

