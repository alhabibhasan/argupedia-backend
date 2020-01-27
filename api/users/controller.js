const express = require('express')
const router = express.Router()

const {createUser, checkIfUserExists} =  require('./users')
const {validateUid, validateEmail, validateDisplayName} = require('./validation')
const validParams = require('../util/validate-argument')

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
    checkIfUserExists(req.body.uid).then(response => {
        res.send({'userExists': response})
    })
    .catch(err => {
        res.statusCode = 400
        res.send({
            error: err
        })
    })
})

module.exports = router