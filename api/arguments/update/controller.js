const express = require('express')
const router = express.Router()
const validParams = require('../../util/validate-argument')
const {validateArg, validateId} = require('../validation')
const {updateArg} = require('./updateArg')

router.patch('/:id', [validateId, validateArg, validParams], (req, res, next) => {
    updateArg(req.params.id, req.body)
    .then(updatedNode => {
        res.send({
            updatedArg: updatedNode
        })
    })
    .catch((err) => {
        res.statusCode = 400
        res.send({
            err
        })
    })
})

module.exports = router