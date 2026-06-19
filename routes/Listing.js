const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const wrapAsync = require("../utils/wrap-async.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const joi = require('joi');
const ExpressError = require("../utils/ExpressErorr.js");
const Listing = require("../models/listing.js");
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }
    next();
}
router.get("/", wrapAsync(async (req, res) => {

    const allListing = await Listing.find();
    res.render("home.ejs", { allListing });
}))

router.get("/new", (req, res) => {
    res.render("form.ejs");
})

router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "listing not found");
        return res.redirect("/listings");
    }
    res.render("show.ejs", { listing });
}))

router.post("/", validateListing, wrapAsync(async (req, res) => {
    let { title, description, image, price, location, country } = req.body;
    let listing = new Listing({
        title: title,
        description: description,
        image: image,
        price: price,
        location: location,
        country: country
    });

    await listing.save();
    req.flash("success", "new listing created");
    res.redirect("/listings");
}));

router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "listing not found");
        return res.redirect("/listings");
    }
    res.render("edit.ejs", { listing });
}))

router.post("/:id/edit", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let { title, description, image, price, location, country } = req.body;
    await Listing.updateOne({ _id: id }, { $set: { title: title, description: description, image: image, price: price, location: location, country: country } })
    req.flash("updated", "listing updated successfully");
    res.redirect("/listings");
}))

router.get("/:id/delete", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("deleted", "listing deleted successfully");
    res.redirect("/listings");
}))


module.exports = router;
