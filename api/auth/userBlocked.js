const users = require('../users/users')

const userBlockedMiddleware = (req, res, next) => {
    let validatedUid = req.body['validated_uid']
    if (!validatedUid || validatedUid.length === 0) {
        res.status(400)
        res.send({
            err: 'Validated UID has not been set, cannot check if user is blocked.'
        })
    }
    users.getUser(validatedUid)
    .then(user => {
        if (user && !user.blocked) {
            next()
        } else {
            res.send({
                err: 'Request denied, user blocked.'
            })
        }
    })
}

module.exports = {
    userBlockedMiddleware
}