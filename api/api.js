const express = require('express')
const router = express.Router()
const {getRootArgChain, getRootArgs} = require('./read/getArgs')
const {createArg, respondToArg} = require('./create/createArg')

const {check, validationResult} = require('express-validator');

const validateId = [
    check('id').isNumeric({no_symbols: true}).withMessage('arg id must be a whole number')
]

const validateArg = [
    check('statement').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('circumstance').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('action').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('newCircumstance').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('goal').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('value').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('argumentBasis').not().isEmpty().withMessage('Argument basis is required.'),
    check('root').isIn(['true', 'false'])
]

const validateArgResponse = [
    check('rootId').isInt({min: 0}).withMessage('ID for root arg must be numeric and > 0'),
    check('statement').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('circumstance').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('action').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('argumentBasis').not().isEmpty().withMessage('Argument basis is required.'),
    check('propertyToRespondTo').not().isEmpty().withMessage('Need a property to respond to.'),
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

router.post('/createArg', [validateArg, validParams], (req, res, next) => {
    createArg(req.body)
    .then(nodeId => {
        res.send({
            nodeId
        })
    })
    .catch(err => {
        res.status(409).send({
            error: err.code
        })
    })
})

router.post('/:id/createResponse', [validateArgResponse, validParams], (req, res, next) => {
    createArg(req.body)
    .then(createdNode => {
        return createdNode
    })
    .then(createdNodeId => {
        console.log(req.body.id)
        let originalNodeId = parseInt(req.body.rootId)
        let attackerId = parseInt(createdNodeId)
        return respondToArg(originalNodeId, attackerId, 'ATTACK', req.body.propertyToRespondTo)
    })
    .then(createdRelationship => {
        res.send({
            createdRelationship
        })
    })
    .catch(err => {
        res.status(409).send({
            error: err.code
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