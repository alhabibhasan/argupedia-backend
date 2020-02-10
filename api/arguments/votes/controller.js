const express = require('express')
const router = express.Router()
const validParams = require('../../util/validate-argument')
const {validateId} = require('../validation')
const {validateUid, validateOptionalUid} = require('../../users/validation')
const {upvote, downvote, getVotes} = require('./votes')
const {argumentExistsMiddleware} = require('../argExistsMiddleware')
const {jwtAuthMiddleware} = require('../../auth/jwt-verify')

router.post('/up/:id', [validateId,
                        validateUid,
                        validParams, 
                        argumentExistsMiddleware, 
                        jwtAuthMiddleware], 
(req, res, next) => {
        upvote(req.params.id, req.body.uid)
        .then(response => {
            res.send(response)
        })
})

router.post('/down/:id', [validateId, 
                          validateUid,
                          validParams, 
                          argumentExistsMiddleware, 
                          jwtAuthMiddleware], 
(req, res, next) => {
    downvote(req.params.id, req.body.uid)
    .then(response => {
        res.send(response)
    })
})

router.post('/:id', [validateId, 
                     validateOptionalUid,
                     validParams, 
                     argumentExistsMiddleware], 
(req, res, next) => {
    getVotes(req.params.id, req.body.uid)
    .then(response => {
        res.send(response)
    })
})

module.exports = router