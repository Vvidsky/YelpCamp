const express = require('express');
const router = express.Router({ mergeParams: true });

const { reviewSchema } = require('../schemas.js');

// utils
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError')

// Mongoose Model
const Campground = require('../models/campground');
const Review = require('../models/review');

// Validate
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// Add a review Route
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    console.log(req.params.id + " " + campground)
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review');
    console.log("Review saved");
    res.redirect('/campgrounds/' + campground._id);
}));

router.delete('/:reviewid', catchAsync(async (req, res) => {
    const { id, reviewid } = req.params;
    console.log(req.params)
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewid}})
    const deletedReview = await Review.findByIdAndDelete(req.params.reviewid);
    console.log(deletedReview)
    console.log("Review Deleted");
    res.redirect('/campgrounds/' + id);
}));

module.exports = router;