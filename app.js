const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

// utils
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')

// Mongoose Model
const Campground = require('./models/campground');
const Review = require('./models/review');

// Validator
const { campgroundSchema, reviewSchema } = require('./schemas.js');

// Routes
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews')

mongoose.connect('mongodb://localhost:27017/YelpCamp')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.log(error);
    });

// Application configuration
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
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    return next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
dotenv.config();

// Landing page
app.get('/', function (req, res) {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError("PAGE NOT FOUND 404", 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "OOPS! Something went wrong"
    res.status(statusCode).render('error', { err });
})

app.listen(process.env.PORT || 3000, () => {
    console.log("listen on port" + process.env.PORT);
})
