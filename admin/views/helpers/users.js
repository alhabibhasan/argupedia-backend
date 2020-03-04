const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))

const getAllUsers = () => {
    let session = driver.session()
    const usersCypher = `MATCH (u:User) 
                         RETURN u {id: u.uid,
                                   email: u.email, 
                                   displayName: u.displayName,
                                   blocked: u.blocked}`
    return session.run(usersCypher)
    .then(response => {
        return response.records.map(rec => {
            return rec._fields[0]
        })
    })
}

module.exports = {
    getAllUsers
}