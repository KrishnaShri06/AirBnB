const express = require("express");
const wrapAsync = require("../utils/wrap-async");
const router = express.Router();
const passport = require("passport");
const flash = require("connect-flash");
const User = require("../models/user.js");
router.get("/signup", (req, res) => {
    res.render("signupForm.ejs");
})
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("registered", `Welcome ${username}`);
        res.redirect("/listings");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("loginForm.ejs");
})

router.post("/login", passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), wrapAsync(async (req, res) => {
    req.flash("success", "Welcome Back! You are Logged in!")
    res.redirect("/listings");
}));
module.exports = router;