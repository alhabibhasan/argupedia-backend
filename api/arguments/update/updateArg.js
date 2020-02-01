const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const {unwrapResult, createArgumentObject} = require('../read/util/argHelpers')

let EXCLUDED_PROPS = ['root', 'parentId', 'id', 'uid']
let EXTRA_PROPS = ['updatedAt', 'deleted']

/**
 * 
 * @param {*} id The ID of the argument to update 
 * @param {*} argValues The new argument values
 * @param {*} deleted Is the value being deleted, false by default.
 */
const updateArg = (id, argValues, deleted = false) => {
    const session = driver.session()
    let setStatements = createSetStatements(Object.keys(argValues))

    argValues.deleted = deleted
    argValues.id = parseInt(id)
    argValues.updatedAt = new Date().toString()

    let updateCypher = `MATCH (arg:Argument) 
                        WHERE ID(arg) = toInteger($id)
                        ` + setStatements + ` 
                        RETURN arg {.*, id: ID(arg)}`

    return session.run(updateCypher, argValues).then(data => {
        let node = unwrapResult(data)[0]
        return createArgumentObject(node)
    })
    .catch(err => {
        console.log(err)
        throw err
    })
}

const createSetStatements = (properties) => {
    let allowedProperties = properties.filter(prop => {
        return !EXCLUDED_PROPS.includes(prop)
    })

    allowedProperties = allowedProperties.concat(EXTRA_PROPS)

    let statement = ``
    for (let i = 0; i<allowedProperties.length; i++) {
        if (EXCLUDED_PROPS.includes(allowedProperties[i])) continue
        statement += 'SET arg.' + allowedProperties[i] + ' = $' + allowedProperties[i] + ' '
    }
    return statement
}

module.exports = {
    updateArg
}