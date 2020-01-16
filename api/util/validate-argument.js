const {validationResult} = require('express-validator');
/**
 * This function will check if the validation process has passed or failed.
 * If failed will set approriate headers to response and will return false. Otherwise, return true.
 * @param req
 */
function validParams(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(422).json({
            errors: errors.array()
        });
        return res.send();
    }
    next()
}

module.exports = validParams