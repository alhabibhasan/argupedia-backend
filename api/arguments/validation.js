const {check} = require('express-validator');
const {camelCaseToSentenceCase} = require('../util/formatting')

const OPTIONAL_FIELDS = ['sourceList']

const DEFAULT_FIELD_REQUIRED_SIZE = 5

const argumentRules = {
    'statement': (statement, validationResults) => {
        if (typeof statement === 'string' && statement.length < 6) {
            validationResults.isValid = false
            validationResults.msg = 'Statement is too short'
            return validationResults
        }
    },
    'argumentBasis': (basis, validationResults) => {
        if (typeof basis === 'string' && basis.length < 4) {
            validationResults.isValid = false
            validationResults.msg = 'Argument basis is too short'
            return validationResults
        }
    },
    'sourceList': (sourceList, validationResults) => {
        if (!Array.isArray(sourceList)) {
            console.log(sourceList)
            validationResults.isValid = false
            validationResults.msg = 'Source list needs to be an array.'
            return validationResults
        }
    },
    'root': (root, validationResults) => {
        if (typeof root !== 'boolean') {
            validationResults.isValid = false
            validationResults.msg = 'Root needs to be of type boolean'
            return validationResults
        }
    },
    'default': (fieldValue, fieldName, validationResults) => {
        if (typeof fieldValue === 'string' && fieldValue.length < DEFAULT_FIELD_REQUIRED_SIZE) {
            validationResults.isValid = false
            validationResults.msg = fieldName + ' is too short.'
            return validationResults
        } 
    }
}

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
        if (!OPTIONAL_FIELDS.includes(objectProperty)) {
            if (!(objectProperty in requestData)) {
                validationResults.isValid = false
                validationResults.msg = 'You are missing the ' + camelCaseToSentenceCase(objectProperty) + ' field.'
                _sendValidationResults(422, validationResults, res)
                return
            }
        }

        let fieldRule = argumentRules[objectProperty]
        let customValidationResults
        if (fieldRule) {
            customValidationResults = fieldRule(requestData[objectProperty], validationResults)
        } else {
            fieldRule = argumentRules['default']
            customValidationResults = fieldRule(requestData[objectProperty], objectProperty, validationResults)
        }
    }

    if (!validationResults.isValid) { 
        _sendValidationResults(422, validationResults, res)
        return
    } else {
        next()
    }

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
    validateArgResponse,
    validateId
}