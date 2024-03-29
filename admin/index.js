const express = require('express')
const router = express.Router()
const {getTemplate} = require('./util')
const {firebase} = require('./firebase/firebase')
const {check} = require('express-validator');
const authErrorMessage = require('./firebase/authErrorMessages').errorMessages
const authMiddle = require('./firebase/authMiddleware')
const {isUserAdmin} = require('../api/users/users')
const dashboard = require('./views/dashboard').router
const validParams = require('../api/util/validate-argument')

const validateCred = [
    check('email')
        .isEmail().withMessage('Needs to be a string'),
    check('password')
        .isString().withMessage('Needs to be a string')
]

router.use(express.urlencoded({ extended: true }))

router.get('/login', [authMiddle.checkLoggedIn], (req, res) => {
    if (req.user) {
        res.render(getTemplate('/templates/dashboard.pug'), {user: req.user})
    } else {
        res.render(getTemplate('/templates/login.pug', {user: req.user}))
    }
})

router.get('/', [authMiddle.checkLoggedIn] ,(req, res) => {
    res.render(getTemplate('/templates/index.pug', {user: req.user}))
})

router.post('/login', [validateCred, validParams] , (req, res) => {
    let email = req.body.email
    let password = req.body.password
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
    .then(() => {
        return firebase.auth().signInWithEmailAndPassword(email, password)
        .then((cred) => {
            if (cred) {
                isUserAdmin(cred.user.uid)
                .then(response => {
                    if (!response.admin) {
                        res.render(getTemplate('/templates/login.pug'), {message: 'You are not an admin.'})
                    } else {
                        res.redirect('/admin/dashboard')
                    }
                }) 
                .catch(err => console.log(err))
            } else {
                res.render(getTemplate('/templates/login.pug'), {message: 'Incorrect details provided.'})
            }
            
        })
    })
    .catch(err => {
        let errMsg = authErrorMessage[err.code]
        res.render(getTemplate('/templates/login.pug'), {message: 'Login failed ' + errMsg})
        res.end()
    })
})

router.get('/logout', (req, res) => {
    firebase.auth().signOut()
    .then(() => {
        res.redirect('/admin/')
    })
})

router.use('/dashboard', [authMiddle.redirectIfLoggedOut], dashboard)

module.exports = router