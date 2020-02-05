const {check} = require('express-validator');

const validateEmail = [
    check('email')
        .isEmail().withMessage('Need to supply an email in the correct format')
]

const validateDisplayName = [
    check('displayName')
        .not().isEmpty().withMessage('Need to supply display name.')
        .isString().withMessage('Display name must be a string.')
]

const validateUid = [
    check('uid')
        .isString().withMessage('UID must be a string.')
        .isLength({min:5}).withMessage('UID is too short')
]

const validateOptionalUid = [
    check('uid')
        .isString().withMessage('UID must be a string.')
        .isLength({min:5}).withMessage('UID is too short')
        .optional()
]

module.exports = {
    validateEmail,
    validateDisplayName,
    validateUid,
    validateOptionalUid
}