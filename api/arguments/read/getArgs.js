const neo4j = require('neo4j-driver').v1
const {getNodeLabels, getNodesWithAttackers} = require('./labeller')
const {getThread} = require('./threader')
const { createArgumentObject,
        arrayContainsArg,
        arrayContainsLink,
        unwrapResult,
        formLink } = require('./util/argHelpers')

const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))

/**
 * Given the node ID for a root argument, this function will return the entire argument chain for that node.
 * So all nodes and relationships between nodes in two separate arrays will be returned.
 * If no relationships exist, then just the root node will be returned.
 * 
 * e.g. __Nodes__: [{id: '1'}, {id: '2'}, {id: '3'}] __Links__: [{source: '1', target: '2'}]
 * @param {Integer} rootId 
 */
const getRootArgChain = (rootId) => {
    const session = driver.session()

    const relationshipsCypher = `MATCH p=(rootArg:Argument)<-[*]-(otherNode) 
                    WHERE ID(rootArg) = toInteger($rootId)
                    RETURN rootArg{.*, id: ID(rootArg), type:labels(rootArg)[0]}, 
                           RELATIONSHIPS(p) AS relationship, 
                           otherNode {.*, id: ID(otherNode), type:labels(otherNode)[0]}`
    let rootNodeChainPromise = session.run(relationshipsCypher, {rootId: rootId})

    const rootNodeCypher = `MATCH (root:Argument) 
                            WHERE ID(root) = toInteger($rootId)
                            AND root.deleted <> true
                            RETURN root {.*, id: ID(root), type:labels(root)[0]}`
    let rootNodePromise = session.run(rootNodeCypher, {rootId: rootId})

    return processLinkedResponse([rootNodePromise, rootNodeChainPromise], session)
    .then(nodesWithLinks => {
        let voteFreeNodeWithLinks = removeVotes(nodesWithLinks)
        let labels = getNodeLabels(voteFreeNodeWithLinks)
        nodesWithLinks.nodes.map(node => {
            if (node.type === 'Argument') {
                let label = labels[node.id]
                node['status'] = label
            }
            return node
        })

        nodesWithLinks.nodes = generateConfigCodes(nodesWithLinks)
        return {
            nodesWithLinks
        }

    })
}

/**
 * Given a node, generate a config code that can be used by the front end to quickly 
 * and easily classify the type and status of an argument. e.g. if an object is an argument and it is OUT or IN then arg-in
 * if an object is a vote that is an up vote or down vote, then vote-up etc.
 */
const generateConfigCodes = (nodesWithLinks) => {
    let nodesWithLinksCopy = JSON.parse(JSON.stringify(nodesWithLinks))
    nodesWithLinksCopy.nodes = nodesWithLinksCopy.nodes.map(node => {
        let nodeCopy = JSON.parse(JSON.stringify(node))
        let configCode = ''
        let nodeType = node.type.toLowerCase()

        if (node.type === 'Argument') {
            let isRoot = (node.root ? 'root' : '')
            let nodeStatus = node.status.toLowerCase()
            if (node.root) configCode = [isRoot, nodeType, nodeStatus].join('-') 
            else configCode = [nodeType, nodeStatus].join('-') 
        }
        if (node.type === 'Vote') {
            let upDown = node.position.toLowerCase()
            configCode = [nodeType, upDown].join('-')
        }

        nodeCopy.configCode = configCode
        return nodeCopy
    })
    return nodesWithLinksCopy.nodes
}

const getLinksBetweenNodes = (argChain) => {
    let unwrappedChain = unwrapResult(argChain);
    let nodes = [];
    let links = [];

    if (unwrappedChain.length > 0) {
        unwrappedChain.forEach(argument => {
            let arg1 = createArgumentObject(argument[0])
            let arg2 = createArgumentObject(argument[2])

            if (!arrayContainsArg(nodes, arg1)) nodes.push(arg1)
            if (!arrayContainsArg(nodes, arg2)) nodes.push(arg2)

            let relationships = argument[1];

            for (var i = relationships.length - 1; i >= 0; i--) {
                let link = formLink(relationships[i])
                if (!arrayContainsLink(links, link)) links.push(link);
            }
            
        })

    }

    return {
        nodes, links
    }
}

/**
 * This function will return all root arguments within the db.
 * 
 * Roots may be connected to one another or may be isolated. As such, a list of nodes and any links will be returned.
 */
const getRootArgs = () => {
    const session = driver.session()

    const linkedRootCypher = `MATCH p=(rootArg:Argument{root:true})-[r]-(args:Argument{root: true})
                              WHERE rootArg.deleted <> true 
                              RETURN DISTINCT rootArg{.*, id:ID(rootArg)}, RELATIONSHIPS(p) AS relationship, args{.*, id:ID(args)}`
    let linkedRootNodeChainPromise = session.run(linkedRootCypher)

    const unlinkedRootCyper = `MATCH (arg:Argument{root: true}) 
                               WHERE arg.deleted <> true 
                               MATCH (user:User) 
                               WHERE arg.creatorUID = user.uid
                               WITH arg, user.displayName as userDisplayName, ID(arg) as id
                               RETURN arg {.*, userDisplayName: userDisplayName, id: id, type:labels(arg)[0]} as arg`

    let unlinkedRootPromise = session.run(unlinkedRootCyper)

    return processLinkedResponse([unlinkedRootPromise, linkedRootNodeChainPromise], session)
}

/**
 * Given an array of promises, this function will wait for all argument related promises to be resolved. It will then carry out any
 * necessary processing to derive a list of nodes and a list of links between the nodes.
 * 
 * The arg promises should be passed in as the unchained nodes first then the chained nodes
 * 
 * @param {[Promises]} argPromises Array of promises.
 * @param {*} session The session to the neo4j instance to be closed after the promises are resolved.
 */
const processLinkedResponse = (argPromises, session) => {
    return Promise.all(argPromises)
    .then(arrayOfResults => {
        session.close()
        
        let unlinkedRoots = arrayOfResults[0] || []
        let linkedRoots = arrayOfResults[1] || []
        let { nodes, links } = getLinksBetweenNodes(linkedRoots)
        nodes = getNodes(unlinkedRoots, nodes) // get unlinked roots and add to list of nodes.

        return {
            nodes, links
        }
    })
}

const getNodes = (response, /*optional*/currentListOfNodes) => {
    if (!response) return currentListOfNodes || []

    let unwrappedNodes = unwrapResult(response)

    if (unwrappedNodes.length === 0) return currentListOfNodes || []

    let nodes = currentListOfNodes || []

    unwrappedNodes.forEach(arg => {
        let parsedArg = createArgumentObject(arg)
        if (!arrayContainsArg(nodes, parsedArg)) nodes.push(parsedArg)
    })

    return nodes
}

const getThreadForRoot = (rootId) => {
    return getRootArgChain(rootId)
    .then(nodes => {
        let nodesWithLinks = nodes.nodesWithLinks
        nodesWithLinks = removeVotes(nodesWithLinks)
        let withAttackers = getNodesWithAttackers(nodesWithLinks)
        return getThread(rootId, withAttackers)
    })
}

const removeVotes = (chain) => {
    let cleanedNodes = chain.nodes.filter(node => node.type !== 'Vote')
    let cleanedLinks = chain.links.filter(link => link.type !== 'Votes')
    return {
        nodes: cleanedNodes,
        links: cleanedLinks
    }
}

module.exports = {
    getRootArgChain,
    getRootArgs,
    getThreadForRoot
}