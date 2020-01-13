
const neo4j = require('neo4j-driver').v1
const {formLink , unwrapResult} = require('../read/util/argHelpers')

const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const session = driver.session()


const createArg = (arg) => {
    let { statement, 
        circumstance, 
        action, 
        newCircumstance, 
        goal, 
        value, 
        root, 
        argumentBasis,
        sourceList,
        parentId } = arg
    
    if (root) { 
        parentId = -1
    }

    const cypher = `CREATE 
                    (arg:Argument {
                        statement: $statement,
                        circumstance: $circumstance,
                        action: $action,
                        newCircumstance: $newCircumstance,
                        goal: $goal,
                        value: $value,
                        root: $root,
                        parentId: $parentId,
                        argumentBasis: $argumentBasis,
                        sourceList: $sourceList
                    })
                    RETURN arg`
    return session.run(cypher, {
        statement,
        circumstance,
        action,
        newCircumstance,
        goal,
        value,
        argumentBasis,
        root,
        parentId,
        sourceList
    })
    .then(data => {
        let node = unwrapResult(data)[0]
        let nodeId = neo4j.integer.toNumber(node.identity)
        node = node.properties
        return {nodeId,node}
    })
    .catch(err => {
        console.log(err, arg)
        throw err
    })
}

const respondToArg = (argToRespondToId, responderId, responseType = 'ATTACK', respondsToProperty) => {
    // Need to check that a relationship exists between node already before adding a new relationship.
    if (!isInt(argToRespondToId) || !isInt(responderId)) {
        console.log('ERROR: RespondToArg. Need integer ID values')
        throw new Error('Need integer ID values')
    }

    const cypher = `MATCH (argToRespondTo:Argument) WHERE ID(argToRespondTo) = toInteger($argToRespondToId)
                    MATCH (respondingArg:Argument) WHERE ID(respondingArg) = toInteger($responderId)
                    CREATE (respondingArg)-[r:` + responseType.toUpperCase() + `]->(argToRespondTo)
                    SET r.respondsToProperty = $respondsToProperty
                    RETURN respondingArg, r, argToRespondTo`

    return session.run(cypher, {argToRespondToId, responderId, responseType, respondsToProperty})
    .then(data => {
        let arg = unwrapResult(data)[0]
        let relationship = formLink(arg[1])
        return relationship
    })
}

const isInt = (value) => {
    return !isNaN(value) && 
            parseInt(Number(value)) == value && 
            !isNaN(parseInt(value, 10))
}


module.exports = {
    createArg,
    respondToArg
}