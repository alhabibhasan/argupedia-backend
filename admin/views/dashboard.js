const express = require('express')
const router = express.Router()
const {check} = require('express-validator');
const {addScheme, getSchemes, getScheme, editScheme, deleteScheme} = require('./argumentSchemes')
const validParams = require('../../api/util/validate-argument')
const validateInput = [
    check('scheme')
        .isString({min:10}).withMessage('Needs to be a string')
]

const {getTemplate} = require('../util')

router.get('/', (req, res, next) => {
    res.render(getTemplate('/templates/dashboard.pug'), 
        {
            message: `Welcome ${req.user.displayName}`, 
            user: req.user 
        }
    )
})

router.get('/schemes/add', (req, res, next) => {
    res.render(getTemplate('/templates/addArgumentSchemes.pug'), {
            user: req.user,
            edit: false,
            route: '/admin/dashboard/scheme/add'
        }
    )
})

router.get('/schemes/view', (req, res, next) => {
    getSchemes()
    .then(response => {
        res.render(getTemplate('/templates/viewArgumentSchemes.pug'), { user: req.user, schemes: response})
    })
})


router.post('/scheme/add', [validateInput, validParams],(req, res, next) => {
    let scheme = JSON.parse(req.body.scheme)
    if (scheme.name.length && scheme.criticalQuestions.length) {
        addScheme({
            label: scheme.name, 
            criticalQuestions: scheme.criticalQuestions
        })
        .then(() => {
            res.render(getTemplate('/templates/addArgumentSchemes.pug'), {message: 'Scheme has been added'})
        })
    } else {
        res.render(getTemplate('/templates/addArgumentSchemes.pug'), {message: 'You are missing fields, try again'})
    }
})

router.get('/scheme/edit/:scheme', [validateInput, validParams],(req, res, next) => {
    getScheme(req.params.scheme)
    .then(scheme => {
        if (scheme) {
            let questions = scheme.criticalQuestions.map(q => {
                return {
                    question: q
                }
            })
            res.render(getTemplate('/templates/addArgumentSchemes.pug'), {
                label: scheme.label, 
                cqs: questions,
                edit: true,
                route: '/admin/dashboard/scheme/edit/' + req.params.scheme
            })
        } else {
            res.send('This scheme doesnt exist.')
        }
    })
})

router.post('/scheme/edit/:scheme', [validateInput, validParams],(req, res, next) => {
    let scheme = JSON.parse(req.body.scheme)
    let id = req.params.scheme

    if (!scheme.name || scheme.criticalQuestions.length === 0) {
        res.send('You need to supply all fields')
    } else {
        editScheme(id, {
            label: scheme.name,
            criticalQuestions: scheme.criticalQuestions
        })
        .then(() => {
            res.send('Updated, here are the new values ' + scheme.name + ' ' + scheme.criticalQuestions)
        })
    }
})

router.get('/scheme/delete/:scheme', [validateInput, validParams],(req, res, next) => {
    let id = req.params.scheme
    getScheme(id)
    .then(scheme => {
        if (scheme) {
            res.render(getTemplate('/templates/confirmDelete.pug'), {
                id: [id],
                label: scheme.label,
                criticalQuestions: scheme.criticalQuestions
            })
        } else {
            res.send('This scheme doesnt exist.')
        }
    })
})

router.get('/scheme/delete/confirm/:scheme', [validateInput, validParams],(req, res, next) => {
    let id = req.params.scheme
    deleteScheme(id)
    .then(resp => res.render(getTemplate('/templates/deleted.pug')))
})


module.exports = {
    router
}