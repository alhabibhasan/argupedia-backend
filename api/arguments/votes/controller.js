const express = require('express')
const router = express.Router()
const validParams = require('../../util/validate-argument')
const {validateId} = require('../validation')
const {validateUid} = require('../../users/validation')

router.post('/up/:id', [validateId, validateUid ,validParams], (req, res, next) => {
    res.send({
        voted: false
    })
})

router.post('/down/:id', [validateId, validateUid ,validParams], (req, res, next) => {
    res.send({
        voted: false
    })
})

module.exports = router