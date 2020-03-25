
const neo4j = require('neo4j-driver').v1
const {formLink , unwrapResult} = require('../read/util/argHelpers')

const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const EXLUDED_PROPS = ['validated_uid', 'uid']

const createArg = (arg) => {
    
    if (root) { 
        parentId = -1
    }

    let createdAt = new Date().toString(),
        updatedAt = new Date().toString()
    let deleted = false
    let uid = arg.validated_uid
    let argCypher = getCypherFromArg(arg)

    const cypher = `CREATE 
                    (arg:Argument {`
                        + argCypher + `
                        createdAt: $createdAt,
                        updatedAt: $updatedAt,
                        deleted: $deleted,
                        creatorUID: $uid
                    })
                    RETURN arg`
    const session = driver.session()
    return session.run(cypher, {...arg, createdAt, updatedAt, deleted, uid})
    .then(data => {
        session.close()
        let node = unwrapResult(data)[0]
        let nodeId = neo4j.integer.toNumber(node.identity)
        node = node.properties
        return {nodeId,node}
    })
    .catch(err => {
        throw err
    })
}

const respondToArg = (argToRespondToId, responderId, responseType = 'ATTACK') => {
    // Need to check that a relationship exists between node already before adding a new relationship.
    if (!isInt(argToRespondToId) || !isInt(responderId)) {
        console.log('ERROR: RespondToArg. Need integer ID values')
        throw new Error('Need integer ID values')
    }

    const cypher = `MATCH (argToRespondTo:Argument) WHERE ID(argToRespondTo) = toInteger($argToRespondToId)
                    MATCH (respondingArg:Argument) WHERE ID(respondingArg) = toInteger($responderId)
                    CREATE (respondingArg)-[r:` + responseType.toUpperCase() + `]->(argToRespondTo)
                    RETURN respondingArg {.*, id: ID(respondingArg)}, r, argToRespondTo{.*, id:ID(argToRespondTo)}`
    const session = driver.session()
    return session.run(cypher, {argToRespondToId, responderId, responseType})
    .then(data => {
        session.close()
        let arg = unwrapResult(data)[0]
        let relationship = formLink(arg[1])
        return relationship
    })
    .catch(err => {
        throw err
    }) 
}

const isInt = (value) => {
    return !isNaN(value) && 
            parseInt(Number(value)) == value && 
            !isNaN(parseInt(value, 10))
}

const getCypherFromArg = (arg) => {
    let keys = Object.keys(arg)
    let cypher = ''
    for (let i = 0; i < keys.length; i++) {
        let santiziedKey = keys[i]
        if (!EXLUDED_PROPS.includes(santiziedKey)) {
            cypher += santiziedKey + ': $' + santiziedKey + ',' + '\n'
        }
    }
    return cypher
}


module.exports = {
    createArg,
    respondToArg
}