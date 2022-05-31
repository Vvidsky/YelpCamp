const express = require('express');
const router = express.Router({ mergeParams: true });

const { reviewSchema } = require('../schemas.js');
const reviews = require('../controllers/reviews');

// utils
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError')
const { validateReview, isLoggedIn, isReviewer } = require('../middleware')

// Mongoose Model
const Campground = require('../models/campground');
const Review = require('../models/review');

// Add a review Route
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewid', isLoggedIn, isReviewer, catchAsync(reviews.deleteReview));

module.exports = router;