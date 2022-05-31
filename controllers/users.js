const User = require('../models/user');

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            console.log(registeredUser);
            req.flash('success', 'Welcome to YelpCamp');
            res.redirect('/campgrounds');
        })
    } catch (err) {
        req.error('error', err.message);
        res.redirect('/register');
    }
}

module.exports.login = async (req, res) => {
    const redirectURL = req.session.returnTo || '/campgrounds';         
    console.log("return to" + req.session.returnTo);          
    delete req.session.returnTo;
    req.flash('success', 'welcome back')
    res.redirect(redirectURL)
}

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'See you soon!')
        res.redirect('/campgrounds')
    });
}