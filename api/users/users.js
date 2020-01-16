
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const session = driver.session()

const createUser = (user) => {
    let {
        uid,
        email
    } = user

    let createdAt = new Date().toString(),
        updatedAt = new Date().toString()

    console.log('hello ' + JSON.stringify(user))

    const cypher = `CREATE 
        (usr:User {
            uid: $uid,
            email: $email,
            createdAt: $createdAt,
            updatedAt: $updatedAt
        })
        RETURN usr`
    return session.run(cypher, {uid,email,createdAt,updatedAt})
    .then(user => {
        // let node = unwrapResult(data)[0]
        // let nodeId = neo4j.integer.toNumber(node.identity)
        // node = node.properties
        // return {nodeId,node}
        console.log(user)
        return user
    })
    .catch(err => {
        console.log(err)
        throw err
    })
}

module.exports = {
    createUser
}