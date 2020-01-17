const express = require('express')
const router = express.Router()
const {createArg, respondToArg} = require('./createArg')
const {check} = require('express-validator');
const validParams = require('../../util/validate-argument')

const validateArg = [
    check('statement')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('circumstance')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('action')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('newCircumstance')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('goal')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('value')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('argumentBasis').not().isEmpty().withMessage('Argument basis is required.'),
    check('root').isIn(['true', 'false'])
]

const validateArgResponse = [
    check('parentId').isInt({min: 0}).withMessage('ID for root arg must be numeric and > 0'),
    check('statement')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('circumstance')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('action')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('argumentBasis')
        .isString().withMessage('Needs to be a string')
        .not().isEmpty().withMessage('Argument basis is required.'),
    check('propertyToRespondTo')
        .isString().withMessage('Needs to be a string')
        .not().isEmpty().withMessage('Need a property to respond to.'),
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