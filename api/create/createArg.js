
const neo4j = require('neo4j-driver').v1

const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const session = driver.session()


const createArg = (arg) => {
    const { statement, circumstance, action, newCircumstance, goal, value, root } = arg

    const cypher = `CREATE 
                    (arg:Argument {
                        statement: $statement,
                        circumstance: $circumstance,
                        action: $action,
                        newCircumstance: $newCircumstance,
                        goal: $goal,
                        value: $value,
                        root: $root
                    })
                    RETURN ID(arg) as nodeId`
    return session.run(cypher, {
        statement,
        circumstance,
        action,
        newCircumstance,
        goal,
        value,
        root
    })
    .then(data => {
        let nodeId = neo4j.integer.toNumber(data.records[0]._fields[0])
        return nodeId
    })
    .catch(err => {
        throw err
    })
}

const respondToArg = (argToRespondToId, responderId, responseType = 'ATTACK') => {
    // Need to check that a relationship exists between node already before adding a new relationship.
    if (!isInt(argToRespondToId) || !isInt(responderId)) return 'Need integer ID values'

    const cypher = `MATCH (argToRespondTo:Argument) WHERE ID(argToRespondTo) = toInteger($argToRespondToId)
                    MATCH (respondingArg:Argument) WHERE ID(respondingArg) = toInteger($responderId)
                    CREATE (respondingArg)-[r:` + responseType.toUpperCase() + `]->(argToRespondTo) RETURN respondingArg, r, argToRespondTo
    `

    session.run(cypher, {argToRespondToId: argToRespondToId, responderId: responderId, responseType: responseType})
    .then(data => {
        console.log(data.records)
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