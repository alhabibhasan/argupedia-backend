const auth = require('./firebase')

const redirectIfLoggedOut = (req, res, next) => {
    let user = auth.firebase.auth().currentUser;
    req.user = user
    if (user) {
        next()
    } else {
        res.redirect('/admin/login')
    }
}

const checkLoggedIn = (req, res, next) => {
    let user = auth.firebase.auth().currentUser;
    req.user = user
    next()
}

module.exports = {
    redirectIfLoggedOut,
    checkLoggedIn
}