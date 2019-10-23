require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');

const neo4j = require('neo4j-driver').v1;

app.use(bodyParser.json());

app.use('/', cors(), (req, res, next) => {
    res.send({
        'data': 'Hello world'
    })
})

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password'))

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
        });
}

const respondToArg = (argToRespondToId, responderId, support = true) => {
    // Need to check that a relationship exists between node already before adding a new relationship.
    if (!isInt(argToRespondToId) || !isInt(responderId)) return 'Need integer ID values';

    const responseType = support ? 'SUPPORTS' : 'ATTACKS'

    const cypher = `MATCH (argToRespondTo:Argument) WHERE ID(argToRespondTo) = toInteger($argToRespondToId)
                    MATCH (respondingArg:Argument) WHERE ID(respondingArg) = toInteger($responderId)
                    CREATE (respondingArg)-[r:` + responseType + `]->(argToRespondTo) RETURN respondingArg, r, argToRespondTo
    `

    session.run(cypher, {argToRespondToId: argToRespondToId, responderId: responderId, responseType: responseType})
    .then(data => {
        console.log(data.records);
    })
}

const getRootArgChain = (rootId) => {
    const noOfNodesInChain = `MATCH p=(rootArg:Argument{root:true})-[*]-(args:Argument) 
                            WHERE ID(rootArg) = toInteger($rootId)
                            RETURN COUNT(p) AS NodeCount`

    let noOfNodesPromise = session.run(noOfNodesInChain, {rootId: rootId})

    const cypher = `MATCH p=(rootArg:Argument{root:true})-[*]-(args:Argument) 
                    WHERE ID(rootArg) = toInteger($rootId)
                    RETURN rootArg, RELATIONSHIPS(p) AS relationship, args`
    let rootNodeChainPromise = session.run(cypher, {rootId: rootId})
  
    Promise.all([noOfNodesPromise, rootNodeChainPromise])
    .then(arrayOfResults => {
        let noOfNodesRes = arrayOfResults[0]
        let rootNodeChainRes = arrayOfResults[1]

        console.log(neo4j.integer.toNumber(noOfNodesRes.records[0]._fields[0]))
        console.log(rootNodeChainRes.records)

        /**
         * TODO: Process the arg chain into a form that can be rendered by the front
         */
    })
}

const isInt = (value) => {
    return !isNaN(value) && 
            parseInt(Number(value)) == value && 
            !isNaN(parseInt(value, 10));
}


// Funct. to create arg
// createArg('Hello there ' + Math.floor(Math.random() * Math.floor(100))).then(result => {
//     console.log(result);
// });


// Funct. to support args.
// respondToArg(37, 28, false)

getRootArgChain(23)


app.listen(port, () => console.log(`App running on port ${port}!`));