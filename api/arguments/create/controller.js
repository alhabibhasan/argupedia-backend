const express = require('express')
const router = express.Router()
const {createArg, respondToArg} = require('./createArg')
const validParams = require('../../util/validate-argument')
const {validateArg ,validateArgResponse} = require('../validation')
const {validateUid} = require('../../users/validation')

router.post('/arg', [validateArg, validateUid ,validParams], (req, res, next) => {
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
        return respondToArg(originalNodeId, attackerId, 'ATTACK')
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