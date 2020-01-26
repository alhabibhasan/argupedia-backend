const {updateArg} = require('../update/updateArg')
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const {unwrapResult} = require('../read/util/argHelpers')

const deleteArg = (id) => {
    let parsedInt = parseInt(id)
    const session = driver.session()
    return isDeleted(parsedInt, session).then(response => {
        session.close()
        let deleted = unwrapResult(response)[0]
        if (deleted === false) {
            return updateArg(parsedInt, getDeletedArg(), true)
        } else {
            return Promise.reject('Arg has already been deleted or does not exist.')
        }
    })
}

const isDeleted = (id, session) => {
    let checkDeletedCypher = `MATCH (arg:Argument) 
                        WHERE ID(arg) = toInteger($id)
                        RETURN arg.deleted`
    
    return session.run(checkDeletedCypher, {id})
    .catch(err => {
        throw err
    })
}

const getDeletedArg = () => {
    return {
        statement : 'The creator of this argument has deleted it.',
        argumentBasis : 'Deleted',
        circumstance : 'Deleted',
        action : 'Deleted',
        newCircumstance : 'Deleted',
        goal : 'Deleted',
        value : 'Deleted',
        sourceList : '[]'
    }
}

module.exports = {
    deleteArg
}