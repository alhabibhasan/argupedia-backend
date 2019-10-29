
const neo4j = require('neo4j-driver').v1

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

export default {
    createArg
}