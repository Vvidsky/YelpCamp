if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

const passport = require('passport');
const LocalStrategy = require('passport-local');

// utils
const { isLoggedIn } = require('./middleware')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')

// Mongoose Model
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user');

// Validator
const { campgroundSchema, reviewSchema } = require('./schemas.js');

// Routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

mongoose.connect('mongodb://localhost:27017/YelpCamp')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.log(error);
    });

// Folder configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: "Thisisasecret",
    resave: false,
    saveUninitialized: true,
    cookie: { 
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(mongoSanitize());
// returnTo doesn't work with 0.6.x passport due to the passport session manager
app.use((req, res, next) => {
    console.log("path", req.query);
    if(!['/login', '/register', '/'].includes(req.originalUrl)) {
        req.session.previousReturnTo = req.session.returnTo; // store the previous url
        req.session.returnTo = req.originalUrl; // assign a new url
        // console.log('req.session.previousReturnTo', req.session.previousReturnTo)
        // console.log('req.session.returnTo', req.session.returnTo);
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    return next();
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// Landing page
app.get('/', function (req, res) {
    res.render('home');
})

// Error Handling
// Page not found
app.all('*', (req, res, next) => {
    next(new ExpressError("PAGE NOT FOUND 404", 404));
})
// Catch errors
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "OOPS! Something went wrong"
    res.status(statusCode).render('error', { err });
})

app.listen(process.env.PORT || 3000, () => {
    console.log("listen on port " + process.env.PORT);
})
