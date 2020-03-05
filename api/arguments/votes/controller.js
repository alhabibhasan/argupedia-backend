const express = require('express')
const router = express.Router()
const validParams = require('../../util/validate-argument')
const {validateId} = require('../validation')
const {validateUid, validateOptionalUid} = require('../../users/validation')
const {upvote, downvote, getVotes} = require('./votes')
const {argumentExistsMiddleware} = require('../argExistsMiddleware')
const {jwtAuthMiddleware} = require('../../auth/jwtVerify')

const voteMiddlewares = [
    validateId,
    validateUid,
    validParams, 
    argumentExistsMiddleware, 
    jwtAuthMiddleware
]

router.post('/up/:id', voteMiddlewares, (req, res) => {
        upvote(req.params.id, req.body.uid)
        .then(response => {
            res.send(response)
        })
})

router.post('/down/:id', voteMiddlewares, (req, res) => {
    downvote(req.params.id, req.body.uid)
    .then(response => {
        res.send(response)
    })
})

router.post('/:id', [validateId, validateOptionalUid,
                     validParams, argumentExistsMiddleware], (req, res) => {
    getVotes(req.params.id, req.body.uid)
    .then(response => {
        res.send(response)
    })
})

module.exports = router