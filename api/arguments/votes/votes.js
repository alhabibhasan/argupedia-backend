
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const voteTypes = {
    'up': 'UP',
    'down' : 'DOWN'
}
const addVote =  (argId, uid, type) => {
    let voteType = voteType[type]
    if (!voteType || !voteType.length || !type || !type.length) {
        return {
            err: 'Need to supply a vote type'
        }
    }

    const createVoteCyper = `CREATE (v:Vote{argId: $argId, 
                                            type: $type , 
                                            uid: $uid, 
                                            createdAt: $createdAt})
                             RETURN v{voteId: ID(v)}`
    const linkToArgumentCyper = `MATCH (v:Vote) WHERE ID(v) = toInteger($voteId) 
                                 MATCH (a:Argument) WHERE ID(a) = toInteger($argId) 
                                 CREATE (v)-[r:Votes]->(a)
                                 RETURN v{.*}, r{.*}, a{.*}`
    
    let vote = {
        argId,
        type: voteType,
        createdAt: new Date().toString(), 
        uid
    }

    let session = driver.session()
    
    
    return session.run(createVoteCyper, vote)
    .then(response => {
        console.log(response)
        // test what we have this far
    })
    
}

module.exports = addVote