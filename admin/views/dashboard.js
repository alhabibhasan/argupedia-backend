const express = require('express')
const router = express.Router()
const {check} = require('express-validator');
const {addScheme, getSchemes, getScheme, editScheme, deleteScheme} = require('./helpers/argumentSchemes')

const userManagement = require('./userManagement').router
const schemeManagement = require('./schemeManagement').router

const validParams = require('../../api/util/validate-argument')
const validateInput = [
    check('scheme')
        .isString({min:10}).withMessage('Needs to be a string')
]

const {getTemplate} = require('../util')

router.get('/', (req, res, next) => {
    res.render(getTemplate('/templates/dashboard.pug'), 
        {
            message: `Welcome ${req.user.displayName}`, 
            user: req.user 
        }
    )
})


router.use('/schemes', schemeManagement)
router.use('/users', userManagement)

module.exports = {
    router
}