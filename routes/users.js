const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');

const User = require('../models/user');
const users = require('../controllers/users')


router.get('/register', async (req, res) => {
    res.render('./users/register');
})

router.post('/register', catchAsync(users.register));

router.get('/login', async (req, res) => {
    res.render('./users/login');
})

// returnTo doesn't work with 0.6.x passport due to the passport session manager
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/campgrounds' }), catchAsync(users.login));

router.get('/logout', users.logout);

module.exports = router;