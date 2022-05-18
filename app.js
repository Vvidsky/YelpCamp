const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const Joi = require('joi');
const app = express();

const { campgroundSchema } = require('./schemas.js');

// utils
const CatchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')

const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
mongoose.connect('mongodb://localhost:27017/YelpCamp')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.log(error);
    });

// Application configuration
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
dotenv.config();

// Landing page
app.get('/', function (req, res) {
    res.render('home');
})

// Index Page
app.get('/campgrounds', async function (req, res) {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

// New Campground page
app.get('/campgrounds/new', async function (req, res) {
    res.render('campgrounds/new');
})

// Validate
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// Create Route
app.post('/campgrounds', validateCampground, catchAsync(async function (req, res, next) {
    const body = req.body;
    const campground = new Campground(body);
    await campground.save();
    console.log(campground);
    console.log("successfully saved");
    res.redirect('/campgrounds')
}));

// Edit Page
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    console.log('Editing campground: ' + campground)
    res.render('campgrounds/edit', { campground })
})

// Detail page
app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    console.log('Found campground: ' + campground)
    res.render('campgrounds/show', { campground })
}));

// Edit Route
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body);
    res.redirect('/campgrounds/' + id);
})

// Delete Route
app.delete('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    console.log('Deleted campground: ' + campground);
    res.redirect('/campgrounds');
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
