const {check} = require('express-validator');

const validateArg = [
    check('statement')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('circumstance')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('action')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('newCircumstance')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('goal')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('value')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('argumentBasis').not().isEmpty().withMessage('Argument basis is required.'),
    check('root').isIn(['true', 'false'])
]

const validateUid = [
    check('uid')
        .isString().withMessage('User UID must be a string')
        .not().isEmpty().withMessage('User UID is required')
]

const validateArgResponse = [
    check('parentId')
        .not().isEmpty().withMessage('Parent ID is a required field')
        .isInt({min: 0}).withMessage('ID for root arg must be numeric and > 0'),
    check('propertyToRespondTo')
        .isString().withMessage('Needs to be a string')
        .not().isEmpty().withMessage('Need a property to respond to.'),
]

const validateId = [
    check('id')
        .not().isEmpty().withMessage('ID is required')
        .isInt({min: 0}).withMessage('ID for root arg must be numeric and > 0'),
]

module.exports = {
    validateArg,
    validateUid,
    validateArgResponse,
    validateId
}