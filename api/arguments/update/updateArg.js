const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const {unwrapResult} = require('../read/util/argHelpers')
const {argumentExists } = require('../argExistsMiddleware')

let EXCLUDED_PROPS = ['root', 'parentId']
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
    let { statement, argumentBasis, circumstance, action, newCircumstance, goal, value, sourceList} = argValues

    let updatedAt = new Date().toString()

    id = parseInt(id)

    let updateCypher = `MATCH (arg:Argument) 
                        WHERE ID(arg) = toInteger($id)
                        ` + setStatements + ` 
                        RETURN arg {.*, id: ID(arg)}`

    return session.run(updateCypher, { id, statement,
        argumentBasis, circumstance,
        action, newCircumstance,
        goal, value,
        sourceList, updatedAt,
        deleted
    }).then(data => {
        let node = unwrapResult(data)[0]
        return node.properties
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