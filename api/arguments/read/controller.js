const express = require('express')
const router = express.Router()
const {getRootArgChain, getRootArgs, getThreadForRoot} = require('./getArgs')
const {argumentExistsMiddleware} = require('../argExistsMiddleware')

const {check} = require('express-validator');
const validParams = require('../../util/validate-argument')
const {validateId} = require('../validation')

router.get('/argChain/:id', [validateId, validParams, argumentExistsMiddleware], (req, res) => {
    getRootArgChain(req.params.id)
    .then(argChain => {
        res.send({
            argChain: argChain.nodesWithLinks,
            labels: argChain.labelledNodes
        })
    })
})

router.get('/rootArgs', (req, res) => {
    getRootArgs()
    .then(rootArgs => {
        res.send({
            rootArgs
        })
    })
})

router.get('/thread/:id', [validateId, validParams, argumentExistsMiddleware], (req, res) => {
    getThreadForRoot(req.params.id)
    .then(thread => {
        res.send({
            thread
        })
    })
})

module.exports = router