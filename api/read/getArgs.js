const neo4j = require('neo4j-driver').v1
const {getNodeLabels} = require('./labeller')
const { createArgumentObject,
        arrayContainsArg,
        arrayContainsLink,
        unwrapResult } = require('./util/argHelpers')

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

    const relationshipsCypher = `MATCH p=(rootArg:Argument{root:true})-[*]-(args:Argument) 
                    WHERE ID(rootArg) = toInteger($rootId)
                    RETURN rootArg, RELATIONSHIPS(p) AS relationship, args`
    let rootNodeChainPromise = session.run(relationshipsCypher, {rootId: rootId})

    const rootNodeCypher = `MATCH (root:Argument) WHERE ID(root) = toInteger($rootId) RETURN root`
    let rootNodePromise = session.run(rootNodeCypher, {rootId: rootId})

    return processQueryResponse([rootNodeChainPromise, rootNodePromise], session)
    .then(nodesWithLinks => {
        let labelledNodes = getNodeLabels(nodesWithLinks)
        return {
            nodesWithLinks,
            labelledNodes
        }
    })
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

const formLink = (relationship) => {
    let relationStart = neo4j.integer.toNumber(relationship.start)
    let relationEnd = neo4j.integer.toNumber(relationship.end)
    let relationType = relationship.type

    let link = {
        source: JSON.stringify(relationStart),
        target: JSON.stringify(relationEnd),
        type: relationType,
    }

    return link;
}

/**
 * This function will return all root arguments within the db.
 * 
 * Roots may be connected to one another or may be isolated. As such, a list of nodes and any links will be returned.
 */
const getRootArgs = () => {
    const session = driver.session()

    const linkedRootCypher = `MATCH p=(rootArg:Argument{root:true})-[r]-(args:Argument{root: true}) 
                              RETURN DISTINCT rootArg, RELATIONSHIPS(p) AS relationship, args`
    let linkedRootNodeChainPromise = session.run(linkedRootCypher)

    const unlinkedRootCyper = `MATCH (arg:Argument{root: true}) RETURN arg`
    let unlinkedRootPromise = session.run(unlinkedRootCyper)

    return processQueryResponse([linkedRootNodeChainPromise, unlinkedRootPromise], session)
}

/**
 * Given an array of promises, this function will wait for all argument related promises to be resolved. It will then carry out any
 * necessary processing to derive a list of nodes and a list of links between the nodes.
 * 
 * @param {[Promises]} argPromises Array of promises.
 * @param {*} session The session to the neo4j instance to be closed after the promises are resolved.
 */
const processQueryResponse = (argPromises, session) => {
    return Promise.all(argPromises)
    .then(arrayOfResults => {
        session.close()

        let linkedRoots = arrayOfResults[0] || []
        let unlinkedRoots = arrayOfResults[1] || []
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

module.exports = {
    getRootArgChain,
    getRootArgs
}