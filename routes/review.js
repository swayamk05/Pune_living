
const express=require("express");
const router = express.Router({ mergeParams: true });
const Listing = require('../models/listing');
const reviews = require('../models/reviews');
const {reviewSchema}=require("../validation.js");
const {isReviewAuthor,isLoggedIn}=require('../middleware.js')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        // In a real app, you would handle this error more gracefully,
        // perhaps by re-rendering the form with an error message.
        throw new Error(msg); // For now, we'll throw a basic error.
    } else {
        next(); // If validation passes, move to the next function (the route handler).
    }
};

router.post("/",isLoggedIn,validateReview,async(req,res)=>{
   let listing=await Listing.findById(req.params.id);
   let newreview=await new reviews(req.body.review);
   newreview.author=req.user._id;
   listing.reviews.push(newreview);
   newreview.save();
   listing.save();
   res.redirect(`/listings/${listing._id}`);
});

router.delete("/:reviewId",isLoggedIn, isReviewAuthor,async (req, res) => {
    // Destructure both IDs from the request parameters
    let { id, reviewId } = req.params;

    // Step 1: Remove the review reference from the corresponding listing.
    // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Step 2: Delete the actual review document from the Review collection.
    await reviews.findByIdAndDelete(reviewId);

    // Step 3: Redirect back to the listing's show page.
    res.redirect(`/listings/${id}`)
});

module.exports=router;