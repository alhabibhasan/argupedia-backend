const express = require('express')
const router = express.Router()
const validParams = require('../../util/validate-argument')
const {validateId} = require('../validation')
const {deleteArg} = require('./deleteArg')
const {argumentExistsMiddleware} = require('../argExistsMiddleware')

router.delete('/:id', [validateId, validParams, argumentExistsMiddleware], (req, res) => {
    deleteArg(req.params.id)
    .then(() => {
        res.send({
            deleted: true
        })
    })
    .catch((err) => {
        res.statusCode = 422
        res.send({
            deleted: false,
            msg: err
        })
    })
})

module.exports = router