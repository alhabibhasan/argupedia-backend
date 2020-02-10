const {unwrapResult, createArgumentObject} = require('./read/util/argHelpers')

const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))

const exists = (id) => {
    let session = driver.session()
    let checkDeletedCypher = `MATCH (arg:Argument) 
                        WHERE ID(arg) = toInteger($id)
                        RETURN arg {.*, id: ID(arg)}`
    
    return session.run(checkDeletedCypher, {id})
    .then(response => {
        session.close()
        let arg = unwrapResult(response)
        let exists, deleted, msg
        exists = arg.length

        if (arg.length) {
            arg = createArgumentObject(arg[0])
            deleted = arg.deleted
        }

        exists = Boolean(exists)
        deleted = Boolean(deleted)

        if (!exists) {
            msg = 'This argument does not exist'
        }

        if (deleted) {
            msg = 'This message has been deleted'
        }

        return Promise.resolve({
            exists, deleted, msg
        })
    })
    .catch(err => {
        throw err
    })
}

const argumentExistsMiddleware = (req, res, next) => {
    exists(req.params.id)
    .then(response => {
        if (response.exists === true && response.deleted === false) {
            next()
        } else if (response.exists === false || response.deleted === true) {
            res.send(response)
        }
    
    })
    .catch(err => {
        res.send(err)
    })
}

module.exports = {
    argumentExistsMiddleware,
    exists // for testing
}