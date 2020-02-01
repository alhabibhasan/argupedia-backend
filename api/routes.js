const express = require('express')
const router = express.Router()

const createArgController = require('./arguments/create/controller')
const readArgController = require('./arguments/read/controller')
const updateArgController = require('./arguments/update/controller')
const deleteArgController = require('./arguments/delete/controller')
const voteArgController = require('./arguments/votes/controller')

const userController = require('./users/controller')

router.use('/arg/create', createArgController)
router.use('/arg/read', readArgController)
router.use('/arg/update', updateArgController)
router.use('/arg/delete', deleteArgController)
router.use('/arg/vote', voteArgController)

router.use('/user', userController)

module.exports = router