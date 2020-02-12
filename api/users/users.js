const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const {unwrapResult} = require('../arguments/read/util/argHelpers')

const createUser = (user) => {
    if (!user.uid || !user.email) return Promise.reject('ERROR: must provide a user uid and email')

    let {
        uid,
        email,
        displayName
    } = user

    let createdAt = new Date().toString(),
        updatedAt = new Date().toString()

    const cypherToCreateUser = `CREATE 
        (usr:User {
            uid: $uid,
            email: $email,
            displayName: $displayName,
            createdAt: $createdAt,
            updatedAt: $updatedAt
        })
        RETURN usr`

    return checkIfUserExists(uid).then(check => {
        if (check.err) return chech.err
        if (check.userExists) {
            return {
                'err' : 'User with uid ' + uid + ' already exists.'
            }
        } else if (!check.userExists) {
            const session = driver.session()
            return session.run(cypherToCreateUser, {uid,email, displayName, createdAt,updatedAt})
            .then(userResponse => {
                session.close()
                let user = unwrapResult(userResponse)[0]
                let userToReturn = {
                    nodeId: neo4j.integer.toNumber(user.identity),
                    uid: user.properties.uid,
                    email: user.properties.email,
                    displayName: user.properties.displayName
                }
                return userToReturn
            })
            .catch(err => {
                throw err
            })
        }
    })
}

const checkIfUserExists = (userId) => {
    if (!userId || !userId.length) return Promise.reject({err: 'ERROR: UID must not be empty or null.'})
    const cypher = `MATCH (user:User) 
                    WHERE user.uid = $userId 
                    RETURN COUNT(user)`
    const session = driver.session()
    return session.run(cypher, {userId})
    .then(response => {
        session.close()
        let userExists = unwrapResult(response)[0]
        let count = neo4j.integer.toNumber(userExists)
        return count > 0
    }).catch(err => {
        throw err
    })
}

module.exports = {
    createUser,
    checkIfUserExists
}