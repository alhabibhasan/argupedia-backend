const {unwrapResult, createArgumentObject} = require('../arguments/read/util/argHelpers')

const argumentExists = (id, session) => {
    let checkDeletedCypher = `MATCH (arg:Argument) 
                        WHERE ID(arg) = toInteger($id)
                        RETURN arg {.*, id: ID(arg)}`
    
    return session.run(checkDeletedCypher, {id})
    .then(response => {
        let arg = unwrapResult(response)
        let exists, deleted
        exists = arg.length

        if (arg.length) {
            arg = createArgumentObject(arg[0])
            deleted = arg.deleted
        }

        return Promise.resolve({
            exists: Boolean(exists), deleted: Boolean(deleted)
        })
    })
    .catch(err => {
        throw err
    })
}

module.exports = {
    argumentExists
}