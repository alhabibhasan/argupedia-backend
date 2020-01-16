const express = require('express')
const router = express.Router()

const {createUser} =  require('./users')

router.post('/create', (req, res) => {
    console.log(req.body)
    createUser(req.body).then((data) => {
        res.send({
            data: JSON.stringify(data)
        })
    })
})

module.exports = router