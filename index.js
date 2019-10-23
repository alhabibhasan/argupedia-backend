require('dotenv').config()

const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const bodyParser = require('body-parser')

const neo4j = require('neo4j-driver').v1

const api = require('./api/api')

app.use(bodyParser.json())

app.use('/api', cors(), api)

const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))

const session = driver.session()


const createArg = (statement) => {
    const cypher = `CREATE 
                    (arg:Argument {
                        statement: $statement
                    })
                    RETURN ID(arg) as nodeId`
    return session.run(cypher, {statement: statement})
        .then(data => {
            let nodeId = neo4j.integer.toNumber(data.records[0]._fields[0])
            return nodeId
        })
}

const respondToArg = (argToRespondToId, responderId, support = true) => {
    // Need to check that a relationship exists between node already before adding a new relationship.
    if (!isInt(argToRespondToId) || !isInt(responderId)) return 'Need integer ID values'

    const responseType = support ? 'SUPPORTS' : 'ATTACKS'

    const cypher = `MATCH (argToRespondTo:Argument) WHERE ID(argToRespondTo) = toInteger($argToRespondToId)
                    MATCH (respondingArg:Argument) WHERE ID(respondingArg) = toInteger($responderId)
                    CREATE (respondingArg)-[r:` + responseType + `]->(argToRespondTo) RETURN respondingArg, r, argToRespondTo
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


// Funct. to create arg
// createArg('Hello there ' + Math.floor(Math.random() * Math.floor(100))).then(result => {
//     console.log(result)
// })


// Funct. to support args.
// respondToArg(37, 28, false)


app.listen(port, () => console.log(`App running on port ${port}!`))