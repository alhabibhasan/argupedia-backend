const express = require('express')
const router = express.Router()
const validParams = require('../../util/validate-argument')
const {validateArg, validateArgResponse, validateId} = require('../validation')
const {updateArg} = require('./updateArg')
const {argumentExistsMiddleware} = require('../argExistsMiddleware')
const {userCreatedPostMiddleware} = require('../../auth/userCreatedPost')
const {jwtAuthMiddleware} = require('../../auth/jwtVerify')

const createPostMiddlewares = [
    validateId,  
    validParams,
    jwtAuthMiddleware, 
    argumentExistsMiddleware,
    userCreatedPostMiddleware]

/**
 * This endpoint is used for 'root' arguments.
 */
router.patch('/:id', [validateArg, ...createPostMiddlewares], (req, res) => {
    updateArgument(req, res)
})

/**
 * End point used to edit responses to arguments.
 */
router.patch('/response/:id', [validateArgResponse, ...createPostMiddlewares], (req, res) => {
    updateArgument(req, res)
})

const updateArgument = (req, res) => {
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
}

module.exports = router