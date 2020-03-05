const express = require('express')
const router = express.Router()
const {getTemplate} = require('../util')
const {check} = require('express-validator');
const schemesHelper = require('./helpers/argumentSchemes')

const validParams = require('../../api/util/validate-argument')
const validateInput = [
    check('scheme')
        .isString({min:10}).withMessage('Needs to be a string')
]

router.get('/add', (req, res, next) => {
    res.render(getTemplate('/templates/addArgumentSchemes.pug'), {
            user: req.user,
            edit: false,
            route: '/admin/dashboard/schemes/add'
        }
    )
})

router.get('/view', (req, res, next) => {
    schemesHelper.getSchemes()
    .then(response => {
        res.render(getTemplate('/templates/viewArgumentSchemes.pug'), { user: req.user, schemes: response})
    })
})


router.post('/add', [validateInput, validParams],(req, res, next) => {
    let scheme = JSON.parse(req.body.scheme)
    console.log('jere')
    if (scheme.name.length && scheme.criticalQuestions.length) {
        schemesHelper.addScheme({
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

router.get('/edit/:scheme', [validateInput, validParams],(req, res, next) => {
    schemesHelper.getScheme(req.params.scheme)
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
                route: '/admin/dashboard/schemes/edit/' + req.params.scheme
            })
        } else {
            res.send('This scheme doesnt exist.')
        }
    })
})

router.post('/edit/:scheme', [validateInput, validParams],(req, res, next) => {
    let scheme = JSON.parse(req.body.scheme)
    let id = req.params.scheme

    if (!scheme.name || scheme.criticalQuestions.length === 0) {
        res.send('You need to supply all fields')
    } else {
        schemesHelper.editScheme(id, {
            label: scheme.name,
            criticalQuestions: scheme.criticalQuestions
        })
        .then(() => {
            res.render(getTemplate('/templates/updated.pug'))
        })
    }
})

router.get('/delete/:scheme', [validateInput, validParams],(req, res, next) => {
    let id = req.params.scheme
    schemesHelper.getScheme(id)
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

router.get('/delete/confirm/:scheme', [validateInput, validParams],(req, res, next) => {
    let id = req.params.scheme
    schemesHelper.deleteScheme(id)
    .then(resp => res.render(getTemplate('/templates/deleted.pug')))
})

module.exports = {
    router
}