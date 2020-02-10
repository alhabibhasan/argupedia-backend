const NodeCache = require( "node-cache" );
const keyCache = new NodeCache();

const {promisify} = require('util')
const jwt = require('jsonwebtoken');
const request = require('request');

const KEY_ID = 'google-public-key'
const KEY_ENDPOINT = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'

const verifyIdToken = (idToken) => {

    let key = keyCache.get(KEY_ID)
    if (!key) {
        console.log(`Key not stored in cache. Need to fetch it`)
        return getKey()
        .then(value => {
            key = value.body
            keyCache.set(KEY_ID, key)
            return verify(idToken, key)
        })
        
    } else {
        console.log(`Key stored in cache. We got this.`)
        return verify(idToken, key)
    }

    
}; 

const getKey = () => {
    let getKeyAsync = promisify(request)
    return getKeyAsync(KEY_ENDPOINT)
}

const verify = (token, keys) => {
    const publicKeys = JSON.parse(keys)
    const header64 = token.split('.')[0];
    const header = JSON.parse(Buffer.from(header64, 'base64').toString('ascii'));
    return jwt.verify(token, publicKeys[header.kid], { algorithms: ['RS256'] }, (err, decoded) => {
        if (err && err.name === 'TokenExpiredError') {
            console.log(`Token expired at ${err.expiredAt}`)
            return Promise.resolve(false)
        } else {
            return Promise.resolve(decoded)
        }
    })
}

const jwtAuthMiddleware = (req, res, next) => {
    const ERR_MSG = 'This is a protected route, you need to supply a authorization token with your request.'
    let token = req.headers.authorization
    if (!token) {
        res.status(401)
        res.send(ERR_MSG)
    } else {
        let extractedToken = token.split('Bearer ')[1]
        verifyIdToken(extractedToken)
        .then(uid => {
            if (!uid) {
                res.status(401)
                res.send(ERR_MSG)
            } else {
                next()
            }
        })
    }
}

module.exports = {
    jwtAuthMiddleware
}