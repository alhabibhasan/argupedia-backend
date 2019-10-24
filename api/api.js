const express = require('express');
const router = express.Router();
const {getRootArgChain} = require('./read/args');

router.get('/getArgChain', (req, res, next) => {
    getRootArgChain(23)
    .then(argChain => {
        res.send({
            argChain
        })
    })
})

module.exports = router