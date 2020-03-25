const {check} = require('express-validator');
const {camelCaseToSentenceCase} = require('../util/formatting')

const OPTIONAL_FIELDS = ['sourceList']

const validateArg = [
    check('statement')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Title must be greater than 5 characters'),
    check('argumentBasis')
        .isString().withMessage('Needs to be a string')
        .isLength({min: 5}).withMessage('Argument basis must be greater than 5 characters'),
    check('root').isIn(['true', 'false'])
]

const validateAllFieldsPresent = (req, res, next) => {
    let validationResults = {
        isValid: true,
        msg: 'Form is valid'
    }
    let requestData = req.body
    let requestKeys = Object.keys(req.body)
    if (!requestKeys || !requestKeys.length) {
        validationResults.isValid = false
        validationResults.msg = 'Validation failed: Request body is empty'
        _sendValidationResults(422, validationResults, res)
        return
    }
   
    for (let objectProperty in requestData) {
        if (OPTIONAL_FIELDS.indexOf(objectProperty)) {
            if (!requestData[objectProperty] || !Boolean(requestData[objectProperty])) {
                validationResults.isValid = false
                validationResults.msg = 'You are missing the ' + camelCaseToSentenceCase(objectProperty) + ' field.'
                _sendValidationResults(422, validationResults, res)
                return;
            }
        }
    }

    next()
}

const _sendValidationResults = (status, data, res) => {
    res.status(status)
    res.send(data)
}

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
    validateAllFieldsPresent,
    validateArg,
    validateArgResponse,
    validateId
}