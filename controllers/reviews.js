// Mongoose Model
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    console.log(req.params.id + " " + campground)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created a new review');
    console.log("Review saved");
    res.redirect('/campgrounds/' + campground._id);
}

module.exports.deleteReview = async(req, res) => {
    const { id, reviewid } = req.params;
    console.log(req.params)
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewid}})
    const deletedReview = await Review.findByIdAndDelete(req.params.reviewid);
    console.log(deletedReview)
    req.flash('success', 'Successfully deleted a review');
    res.redirect('/campgrounds/' + id);
}