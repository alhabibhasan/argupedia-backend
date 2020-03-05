const express = require('express')
const router = express.Router()

const userManagement = require('./userManagement').router
const schemeManagement = require('./schemeManagement').router

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