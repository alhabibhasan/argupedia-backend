const express = require('express')
const router = express.Router()

const {createUser, getUser } =  require('./users')

const {getArgsPostedByUser} = require('./postedContent')
const {validateUid, validateEmail, validateDisplayName, validateRootOption} = require('./validation')
const validParams = require('../util/validate-argument')
const {jwtAuthMiddleware} = require('../auth/jwtVerify')

router.post('/create', [validateEmail, validateDisplayName, validateUid, validParams] ,(req, res) => {
    createUser(req.body).then((data) => {
        res.send({
            data: JSON.stringify(data)
        })
    })
    .catch(err => {
        res.statusCode = 400
        res.send({
            error: err
        })
    })
})

router.post('/check', [validateUid, validParams], (req, res) => {
    getUser(req.body.uid).then(user => {
        if (user) {
            res.send({
                'userExists': Boolean(user),
                'blocked': Boolean(user.blocked)
             })
        }
    })
    .catch(err => {
        res.statusCode = 400
        res.send({
            error: err
        })
    })
})

router.get('/posts', [jwtAuthMiddleware], (req, res) => {
    getArgsPostedByUser(req.body['validated_uid'], true) // get roots
    .then(rootPosts => {
        return getArgsPostedByUser(req.body['validated_uid'], false) // get non roots
        .then(nonRoots => {
            res.send({
                rootPosts,
                nonRoots
            })
        })
        .catch(err => {
            throw err
        })
    }) 
    .catch(err => {
        res.status(500)
        res.send(err)
    })
})

module.exports = router