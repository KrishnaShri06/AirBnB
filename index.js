const express = require("express");
const app = express();
const mongoose = require('mongoose');
const ExpressError = require("./utils/ExpressErorr.js");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
main()
    .then(() => {
        console.log("connection successful");
    }).catch((err) => {
        console.log(err);
    })

const port = 3000;
const path = require("path");
const listingRouter = require("./routes/Listing.js");
const reviewRouter = require("./routes/Review.js");
const userRouter = require("./routes/User.js");
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

const sessionOption = {
    secret: "mysupersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}
//session codes
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.msgs = req.flash("success");
    res.locals.del = req.flash("deleted");
    res.locals.up = req.flash("updated");
    res.locals.reviewMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    res.locals.registerMsg = req.flash("registered");
    next();
})
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.redirect("/signup");
})

app.all("*any", (req, res, next) => {
    next(new ExpressError(404, "page not found"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { statusCode, message, err });
    // res.status(statusCode).send(message);
})
