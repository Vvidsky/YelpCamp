const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schemas.js');
const { storage } = require('../cloudinary')
const multer  = require('multer')
const upload = multer({ storage })

//controller
const campgrounds = require('../controllers/campgrounds');

// utils
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const catchAsync = require('../utils/catchAsync');

// Index Page
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

// New Campground page
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.renderShowPage))
    .put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// Edit Page
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditingForm));


module.exports = router;