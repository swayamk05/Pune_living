module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to access that page.');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    // We check if the session contains the 'returnTo' URL that we saved in isLoggedIn.
    if (req.session.returnTo) {
        // If it exists, we save it to res.locals. This makes the URL available
        // in the route handler after Passport successfully authenticates the user.
        res.locals.redirectUrl = req.session.returnTo;
    }
    // We call next() to proceed to the next middleware in the chain (e.g., passport.authenticate).
    next();
};

const Listing = require("./models/listing");

// isOwner Authorization Middleware
module.exports.isOwner = async (req, res, next) => {
    // Step 1: Get the ID of the listing from the URL parameters.
    const { id } = req.params;
    
    // Step 2: Find the listing in the database using its ID.
    const listing = await Listing.findById(id);

    // Step 3: Check if the listing's owner ID is the same as the currently logged-in user's ID.
    // We use the .equals() method because Mongoose ObjectIDs are complex objects,
    // and a simple '===' comparison would not work correctly.
    if (!listing.owner.equals(req.user._id)) {
        // Step 4: If the user is NOT the owner, flash an error message
        // and redirect them back to the listing's page.
        req.flash('error', 'You do not have permission to perform that action.');
        return res.redirect(`/listings/${id}`);
    }

    // Step 5: If the user IS the owner, call next() to proceed to the
    // next function in the route (the actual update or delete logic).
    next();
};

const Review = require("./models/reviews");

// isReviewAuthor Middleware
// This function checks if the currently logged-in user is the author of a specific review.
module.exports.isReviewAuthor = async (req, res, next) => {
    // Step 1: Extract the listing ID and review ID from the URL parameters.
    // The route is nested, so both are available (e.g., /listings/:id/reviews/:reviewId).
    const { id, reviewId } = req.params;
    
    // Step 2: Find the specific review in the database using its ID.
    const review = await Review.findById(reviewId);

    // Step 3: Check if the review's author ID matches the currently logged-in user's ID.
    // We must use the .equals() method to compare Mongoose ObjectIDs correctly.
    if (!review.author.equals(req.user._id)) {
        // Step 4: If the IDs do not match, the user is not authorized.
        // Flash an error message and redirect them back to the main listing page.
        req.flash('error', 'You do not have permission to delete this review.');
        return res.redirect(`/listings/${id}`);
    }

    // Step 5: If the IDs match, the user is authorized.
    // Call next() to proceed to the next function in the route handler (the delete logic).
    next();
};