const {exists} = require('../arguments/argExistsMiddleware')

const ERR_MSG = 'userCreatedPost middleware check failed'
const userCreatedPostMiddleware = (req, res, next) => {
    let validation = validationChecks(req, res)

    if (!validation.pass) {
        res.status(401)
        res.send({ERR_MSG, info: validation.info})
    } else {
        exists(req.params.id)
        .then(argument => {
            if (req.body['validated_uid'] === argument.creatorUid) {
                next()
            } else {
                res.status(401)
                res.send({
                    ERR_MSG,
                    info: `Requesting user didn't create this argument so cannot make changes to it.`
                })
            }
            
        })
    }

}

const validationChecks = (req, res) => {
    let validatedUserId = req.body['validated_uid']
    if (!validatedUserId || validatedUserId.length === 0) {
        return {
            pass: false,
            info: `validated_uid param is missing, you need to supply valid auth token. 
                    Check that you called the jwtTokenVerify middleware before this one.`
        }
    }

    let argId = req.params.id

    if (!argId) {
        return {
            pass: false,
            info: 'Arg ID is missing for some reason from userCreatedPostMiddleware'
        }
    }

    return { pass: true }
}

module.exports = {
    userCreatedPostMiddleware
}