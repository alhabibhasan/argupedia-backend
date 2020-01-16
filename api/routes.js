const express = require('express')
const router = express.Router()

const createArgController = require('./arguments/create/controller')
const readArgController = require('./arguments/read/controller')

const userController = require('./users/controller')

router.use('/arg/create', createArgController)
router.use('/arg/read', readArgController)

router.use('/user', userController)

module.exports = router