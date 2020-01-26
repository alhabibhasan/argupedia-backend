const express = require('express')
const router = express.Router()
const validParams = require('../../util/validate-argument')
const {validateId} = require('../validation')
const {deleteArg} = require('./deleteArg')

router.delete('/:id', [validateId, validParams], (req, res) => {
    deleteArg(req.params.id)
    .then(() => {
        res.send({
            deleted: true
        })
    })
    .catch((err) => {
        res.statusCode = 400
        res.send({
            deleted: false,
            err
        })
    })
})

module.exports = router