const express = require('express')
const router = express.Router()
const {createArg, respondToArg} = require('./createArg')
const {check} = require('express-validator');
const validParams = require('../../util/validate-argument')

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
    check('parentId').isInt({min: 0}).withMessage('ID for root arg must be numeric and > 0'),
    check('statement').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('circumstance').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('action').isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('argumentBasis').not().isEmpty().withMessage('Argument basis is required.'),
    check('propertyToRespondTo').not().isEmpty().withMessage('Need a property to respond to.'),
]

router.post('/arg', [validateArg, validParams], (req, res, next) => {
    let createdNodeToReturn
    createArg(req.body)
    .then(createdNode => {
        createdNodeToReturn = createdNode.node
        createdNodeToReturn.id = createdNode.nodeId
        res.send({
            createdNode: createdNodeToReturn
        })
    })
    .catch(err => {
        console.log(err)
        res.status(409).send({
            error: err.code
        })
    })
})

router.post('/response/:id', [validateArgResponse, validParams], (req, res, next) => {
    let createdNodeToReturn
    createArg(req.body)
    .then(createdNode => {
        createdNodeToReturn = createdNode.node
        createdNodeToReturn.id = createdNode.nodeId
        return createdNode
    })
    .then(createdNode => {
        let originalNodeId = parseInt(req.body.parentId)
        let attackerId = parseInt(createdNode.nodeId)
        return respondToArg(originalNodeId, attackerId, 'ATTACK', req.body.propertyToRespondTo)
    })
    .then(createdRelationship => {
        res.send({
            createdNode: createdNodeToReturn,
            createdRelationship: createdRelationship
        })
    })
    .catch(err => {
        console.log(err)
        res.status(409).send({
            error: err.code
        })
    })
})

module.exports = router