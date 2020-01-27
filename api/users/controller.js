const express = require('express')
const router = express.Router()

const {createUser, checkIfUserExists} =  require('./users')
const {check} = require('express-validator');
const validParams = require('../util/validate-argument')

const validateEmail = [
    check('email')
        .isEmail().withMessage('Need to supply an email in the correct format')
]

const validateDisplayName = [
    check('displayName')
        .not().isEmpty().withMessage('Need to supply display name.')
        .isString().withMessage('Display name must be a string.')
]

const validateUid = [
    check('uid')
        .isString().withMessage('UID must be a string.')
        .isLength({min:5}).withMessage('UID is too short')
]

router.post('/create', [validateEmail, validateDisplayName, validateUid, validParams] ,(req, res) => {
    createUser(req.body).then((data) => {
        res.send({
            data: JSON.stringify(data)
        })
    })
    .catch(err => {
        res.statusCode = 400
        res.send({
            error: err
        })
    })
})

router.post('/check', [validateUid, validParams], (req, res) => {
    checkIfUserExists(req.body.uid).then(response => {
        res.send({'userExists': response})
    })
    .catch(err => {
        res.statusCode = 400
        res.send({
            error: err
        })
    })
})

module.exports = router