const threadify = (rootNode, allNodes) => {
    if (rootNode.attacker && rootNode.attackers.length === 0) {
        return rootNode
    } else {
        rootNode.attackers = rootNode.attackers.map(attacker => {
            let fullNodeValue = allNodes.filter(arg => arg.node.id === attacker.id)[0]
            return fullNodeValue
        })

        rootNode.attackers.forEach(attacker => {
            threadify(attacker, allNodes)
        })

        return rootNode
    }
}

const getThread = (nodeId, allNodes) => {
    let rootNode = allNodes.filter(arg => arg.node.id == nodeId)[0]
    if (!rootNode) return 'THREAD CREATION ERROR: Root node with ID: ' + nodeId + ' not found.'
    return threadify(rootNode, allNodes)
}

module.exports = {
    getThread
}