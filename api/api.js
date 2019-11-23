const express = require('express')
const router = express.Router()
const {getRootArgChain, getRootArgs} = require('./read/getArgs')
const {createArg} = require('./read/getArgs')

const {check, validationResult} = require('express-validator');

const validateId = [
    check('id').isNumeric({no_symbols: true}).withMessage('arg id must be a whole number')
]

router.get('/getArgChain/:id', [validateId, validParams], (req, res, next) => {
    getRootArgChain(req.params.id)
    .then(argChain => {
        res.send({
            argChain: argChain.nodesWithLinks,
            labels: argChain.labelledNodes
        })
    })
})

router.get('/getRootArgs', (req, res, next) => {
    getRootArgs()
    .then(rootArgs => {
        res.send({
            rootArgs
        })
    })
})

/**
 * This function will check if the validation process has passed or failed.
 * If failed will set approriate headers to response and will return false. Otherwise, return true.
 * @param req
 */
function validParams(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            errors: errors.array()
        });
        return res.send();
    }
    next()
}

module.exports = router