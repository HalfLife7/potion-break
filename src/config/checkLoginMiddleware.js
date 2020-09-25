function checkLogin(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
        // add error for you must be logged in
    }
}

module.exports = checkLogin;