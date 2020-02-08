
const neo4j = require('neo4j-driver').v1
const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))
const {unwrapResult} = require('../read/util/argHelpers')
const votePositions = {
    'up': 'UP',
    'down' : 'DOWN'
}
/**
 * This function is called to add a vote of a given position.
 * 
 * It will : 
 * - check if a vote has already been added in which case it will remove the vote.
 * - if user has up voted and now is trying to down vote, will remove the up vote and add the down vote and vice versa
 * 
 * @param {*} argId 
 * @param {*} uid 
 * @param {*} position 
 */
const castVote =  (argId, uid, position) => {
    let votePosition = votePositions[position]
    if (!votePosition || !votePosition.length || !position || !position.length) {
        return Promise.resolve({
            err: 'Need to supply a vote position'
        })
    }

    return checkIfVoteExists(argId, uid)
    .then(voteExists => {
        if (!voteExists) {
            return createVote(argId, uid, votePosition)
        } else if (voteExists.position && voteExists.position === votePosition) {
            // check if current requested position matches stored position, if so delete vote
            return deleteVote(argId, uid, votePosition)
        } else if (voteExists.position && voteExists.position !== votePosition) {
            // if current requested position doesnt match, deleted stored and save requested position
            return deleteVote(argId, uid)
            .then(() => {
                return createVote(argId, uid, votePosition)
            })
        }
    })
    
}

const deleteVote = (argId, uid, position) => {
    let deleteVoteCypher = `MATCH (v:Vote) 
                        WHERE v.argId=toInteger($argId) AND v.uid=$uid
                        DETACH DELETE v`
    let session = driver.session()
    return session.run(deleteVoteCypher, {argId, uid})
    .then(() => {
        let returnObj = {
            voted: 'DELETED ' + position + ' VOTE' ,
            argId,
        }
        return returnObj
    })
}

const createVote = (argId, uid, position) => {
    const createVoteCyper = `CREATE (v:Vote{argId: toInteger($argId), 
                                    position: $position , 
                                    uid: $uid,
                                    deleted: $deleted,
                                    createdAt: $createdAt})
                            RETURN v{voteId: ID(v)}`

        const linkToArgumentCyper = `MATCH (v:Vote) WHERE ID(v) = toInteger($voteId) 
                                    MATCH (a:Argument) WHERE ID(a) = toInteger($argId) 
                                    CREATE (v)-[r:Votes]->(a)
                                    RETURN v{.*}, r{.*}, a{.*}`

        let vote = {
            argId,
            position,
            createdAt: new Date().toString(), 
            deleted: false,
            uid
        }

        let session = driver.session()

        return session.run(createVoteCyper, vote)
        .then(response => {
            let voteId = unwrapResult(response)[0].voteId
            return session.run(linkToArgumentCyper, { voteId, argId })
            .then(response => {
                session.close()
                let returnObj = {
                    voted: vote.position,
                    argId,
                }
                return returnObj
            })
        })
}

const checkIfVoteExists = (argId, uid) => {
    let checkVoteExistsCypher = `MATCH (v:Vote) 
                                WHERE v.argId=toInteger($argId)
                                AND v.uid=$uid
                                AND v.deleted=false
                                RETURN v {position: v.position}`
    let session = driver.session()
    return session.run(checkVoteExistsCypher, {argId, uid})
    .then(response => {
        let voteExists = unwrapResult(response)[0]
        return voteExists
    }) 
}

const getVotes = (argId, uid = '') => {
    const getVotesCypher = `MATCH (v:Vote) WHERE v.argId = toInteger($argId) AND v.position='DOWN'
                            RETURN {downvotes: COUNT(v)} AS votes
                            UNION
                            MATCH (v:Vote) WHERE v.argId = toInteger($argId) AND v.position='UP'
                            RETURN {upvotes: COUNT(v)} AS votes`

    let session = driver.session()
    return session.run(getVotesCypher, {argId})
    .then((votes) => {
        session.close()
        votes = unwrapResult(votes)
        let upvotes, downvotes
        if (votes.length === 2) {
            downvotes = neo4j.integer.toNumber(votes[0].downvotes)
            upvotes = neo4j.integer.toNumber(votes[1].upvotes)
        }
        let toReturn = {
            upvotes, downvotes
        }
        if (uid && uid.length > 0) {
            return checkIfVoteExists(argId, uid)
            .then(userVote => {
                if (userVote && userVote.position) {
                    toReturn['userVote'] = userVote.position
                    return toReturn
                } else {
                    return toReturn
                }
            })
        }
        return toReturn
    })
}

const upvote = (argId, uid) => {
    return castVote(argId, uid, 'up')
}

const downvote = (argId, uid) => {
    return castVote(argId, uid, 'down')
}

module.exports = {
    upvote,
    downvote,
    getVotes
}