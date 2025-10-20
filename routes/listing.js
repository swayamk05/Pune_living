const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const multer = require('multer');
const { storage, cloudinary } = require('../cloudconfig.js'); // Corrected path if needed
const upload = multer({ storage });

// --- INDEX & SEARCH ROUTE (Single, Corrected Version) ---
router.get("/", async (req, res) => {
    const searchQuery = req.query.q;

    if (searchQuery) {
        // --- Search Logic ---
        const allListings = await Listing.find({
            location: { $regex: searchQuery, $options: "i" } 
        });
        res.render("listings/index", { allListings, searchQuery });
    } else {
        // --- Homepage Logic ---
        const allListings = await Listing.find({});
        res.render("listings/home", { allListings });
    }
});

// NEW Route: Display form to create a new listing
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/create.ejs");
});

// SHOW Route: Display details for one specific listing
router.get("/:id", async (req, res) => {
    let { id } = req.params;
    
    // The variable is now 'listing' (singular) because we are finding one item
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "The listing you requested does not exist.");
        return res.redirect("/listings");
    }
    
    // We pass the single 'listing' object to the template
    res.render("listings/show.ejs", { listing });
});

// CREATE Route: Save a new listing
router.post("/", isLoggedIn, upload.array('listing[images]', 5), async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await newListing.save();
    req.flash('success', 'New listing created!');
    res.redirect("/listings");
});

// EDIT Route: Display form to edit a listing
router.get("/:id/edit", isLoggedIn, isOwner, async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing }); // Correctly uses 'listing' (singular)
});

// UPDATE Route: Save changes to a listing
router.put("/:id", isLoggedIn, isOwner, upload.array("listing[images]", 5), async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        listing.images.push(...newImages);
        await listing.save();
    }

    if (req.body.deleteImages && req.body.deleteImages.length > 0) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await listing.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
});

// DELETE Route: Remove a listing
router.delete("/:id", isLoggedIn, isOwner, async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted!');
    res.redirect("/listings");
});

module.exports = router;

