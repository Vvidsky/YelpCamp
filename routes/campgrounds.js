const express = require('express');
const router = express.Router();
const { campgroundSchema} = require('../schemas.js');

// utils
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError')

// Mongoose Model
const Campground = require('../models/campground');

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

// Index Page
router.get('/', async function (req, res) {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

// New Campground page
router.get('/new', async function (req, res) {
    res.render('campgrounds/new');
})

// Edit Page
router.get('/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    } else {
        console.log('Editing campground: ' + campground)
        res.render('campgrounds/edit', { campground })
    }
})

// Detail page
router.get('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds');
    } else {
        console.log('Found campground: ' + campground)
        res.render('campgrounds/show', { campground })
    } 
}));

// Create Route
router.post('/', validateCampground, catchAsync(async function (req, res, next) {
    const body = req.body;
    const campground = new Campground(body);
    await campground.save();
    req.flash('success', "Successfully created a new campground");
    console.log(campground);
    console.log("successfully saved");
    res.redirect('/campgrounds')
}));

// Edit Route
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body);
    req.flash('success', "Successfully updated the campground");
    res.redirect('/campgrounds/' + id);
})

// Delete Route
router.delete('/:id', async (req, res) => {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    console.log('Deleted campground: ' + campground);
    res.redirect('/campgrounds');
})

module.exports = router;