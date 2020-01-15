const express = require('express')
const router = express.Router()

const createController = require('./create/controller')
const readController = require('./read/controller')

router.use('/create', createController)
router.use('/read', readController)

module.exports = router