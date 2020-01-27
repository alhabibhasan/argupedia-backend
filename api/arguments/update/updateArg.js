const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const {unwrapResult} = require('../read/util/argHelpers')
const {isDeleted } = require('../util')

let EXCLUDED_PROPS = ['root']
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

    return isDeleted(id, session).then(response => {
        session.close()
        let isAlreadyDeleted = unwrapResult(response)[0]
        if (isAlreadyDeleted === true) {
            let msg = 'Arg has been deleted or does not exist.'
            return Promise.reject(msg)
        }

        let updateCypher = `MATCH (arg:Argument) 
                            WHERE ID(arg) = toInteger($id)
                            ` + setStatements + ` 
                            RETURN arg`

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
            throw err
        })
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