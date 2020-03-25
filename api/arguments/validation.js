const {check} = require('express-validator');

const validateArg = [
    check('statement')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('argumentBasis')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Argument basis must be greater than 5 characters'),
    check('root').isIn(['true', 'false'])
]

const validateArgResponse = [
    check('parentId')
        .not().isEmpty().withMessage('Parent ID is a required field')
        .isInt({min: 0}).withMessage('ID for root arg must be numeric and > 0'),
    check('argumentBasis')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Argument basis must be greater than 5 characters'),
    check('statement')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
]

const validateId = [
    check('id')
        .not().isEmpty().withMessage('ID is required')
        .isInt({min: 0}).withMessage('ID for root arg must be numeric and > 0'),
]

module.exports = {
    validateArg,
    validateArgResponse,
    validateId
}