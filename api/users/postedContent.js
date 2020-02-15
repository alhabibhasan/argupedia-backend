const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const {unwrapResult} = require('../arguments/read/util/argHelpers')
const {getVotes} = require('../arguments/votes/votes')

const getArgsPostedByUser = (uid, root) => {
    const cypher = `MATCH (arg:Argument) 
                    WHERE arg.creatorUID = $uid 
                    AND arg.deleted = FALSE 
                    AND arg.root = $root 
                    return arg {statement: arg.statement, createdAt: arg.createdAt, id: toString(ID(arg))}`
    let session = driver.session()
    return session.run(cypher, {uid, root})
    .then(response => {
        let posts = unwrapResult(response)
        let votes = posts.map(post => {
            return getVotes(post.id)
        })

        return Promise.all(votes)
        .then(postWithVotes => {
            return posts.map((post, index) => {
                post['votes'] = postWithVotes[index]
                return post
            })
        })
    })
}

module.exports = {
    getArgsPostedByUser
}