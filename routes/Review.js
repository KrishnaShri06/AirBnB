const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrap-async.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const joi = require('joi');
const ExpressError = require("../utils/ExpressErorr.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }
    next();
}
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { review } = req.body;
    let listing = await Listing.findById(id);
    let newReview = new Review(review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("review added");
    req.flash("success", "Review added successfully");
    res.redirect(`/listings/${id}`);
}))

router.post("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))
module.exports = router;