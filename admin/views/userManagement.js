const express = require('express')
const router = express.Router()
const {getTemplate} = require('../util')
const {getAllUsers} = require('./helpers/users')
const {validateUid} = require('../../api/users/validation')
const validParams = require('../../api/util/validate-argument')

const {getUser, setUserBlock} = require('../../api/users/users')

router.get('/', (req, res, next) => {
    getAllUsers()
    .then(users => {
        res.render(getTemplate('/templates/manageUsers.pug'), {users})
    })
})

router.get('/block/:uid', [validateUid, validParams], (req, res, next) => {
    let uid = req.params.uid
    setUserBlock(uid, true)
    .then(user => {
        if (user.blocked) res.redirect('/admin/dashboard/users')
    })
})

router.get('/unblock/:uid', [validateUid, validateUid], (req, res, next) => {
    let uid = req.params.uid
    setUserBlock(uid, false)
    .then(user => {
        if (!user.blocked) res.redirect('/admin/dashboard/users')
    })
})

module.exports = {
    router
}