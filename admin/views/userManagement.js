const express = require('express')
const router = express.Router()
const {getTemplate} = require('../util')
const userHelper = require('./helpers/users')
const {validateUid} = require('../../api/users/validation')
const validParams = require('../../api/util/validate-argument')

const userOps = require('../../api/users/users')

router.get('/', (req, res, next) => {
    userHelper.getAllUsers()
    .then(users => {
        // remove the current user from the list
        users = users.filter(user => user.id !== req.user.uid)
        res.render(getTemplate('/templates/manageUsers.pug'), {users})
    })
})

router.get('/block/:uid', [validateUid, validParams], (req, res, next) => {
    let uid = req.params.uid
    userOps.setUserBlock(uid, true)
    .then(user => {
        if (user.blocked) res.redirect('/admin/dashboard/users')
    })
})

router.get('/unblock/:uid', [validateUid, validateUid], (req, res, next) => {
    let uid = req.params.uid
    userOps.setUserBlock(uid, false)
    .then(user => {
        if (!user.blocked) res.redirect('/admin/dashboard/users')
    })
})

module.exports = {
    router
}