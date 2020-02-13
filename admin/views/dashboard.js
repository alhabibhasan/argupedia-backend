const express = require('express')
const router = express.Router()
const {check} = require('express-validator');
const {addScheme, getSchemes} = require('./argumentSchemes')
const validateInput = [
    check('scheme')
        .isString({min:10}).withMessage('Needs to be a string')
]

const {getTemplate} = require('../util')

router.get('/', (req, res, next) => {
    res.render(getTemplate('/templates/dashboard.pug'), 
        {
            // message: `Welcome ${req.user.displayName}`, 
            user: req.user 
        }
    )
})

router.get('/add-argument-schemes', (req, res, next) => {
    res.render(getTemplate('/templates/addArgumentSchemes.pug'), 
        {
            user: req.user 
        }
    )
})

router.get('/view-argument-schemes', (req, res, next) => {
    getSchemes()
    .then(response => {
        res.render(getTemplate('/templates/viewArgumentSchemes.pug'), 
        {
            user: req.user,
            schemes: response
        }
    )
    })
})

router.post('/add-argument-schemes', [validateInput],(req, res, next) => {
    let scheme = JSON.parse(req.body.scheme)
    if (scheme.name.length && scheme.criticalQuestions.length) {
        addScheme({
            label: scheme.name, 
            criticalQuestions: scheme.criticalQuestions
        })
        .then(() => {
            res.render(getTemplate('/templates/addArgumentSchemes.pug'), {message: 'Scheme has been added'})
        })
    } else {
        res.render(getTemplate('/templates/addArgumentSchemes.pug'), {message: 'You are missing fields, try again'})
    }
})

router.get('/scheme/edit/:scheme', [validateInput],(req, res, next) => {
    res.send(req.params.scheme)
})


module.exports = {
    router
}