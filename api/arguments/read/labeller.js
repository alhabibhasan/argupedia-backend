const IN = 'IN'
const OUT = 'OUT'
const UNDECIDED = 'UNDECIDED'


const markOuterMostNodes = (nodes, originalNodes, nodeStatusMap = {}) => {
    nodes.forEach(node => {
        let nodeRef = originalNodes.filter(x => x.node.id === node.id)[0]
        if (nodeRef && nodeRef.attackers.length === 0) {
            nodeRef.node.status = IN
            nodeStatusMap[nodeRef.node.id] = IN
            return nodeRef;
        } else if (nodeRef && nodeRef.attackers) {
            return markOuterMostNodes(nodeRef.attackers, originalNodes, nodeStatusMap)
        } else {
            markOuterMostNodes(node.attackers, originalNodes, nodeStatusMap)
        }
    })
}

const markRemainingNodes = (markedNodes, nodeStatusMap) => {
    let noOfNodes = markedNodes.length
    let currNode = -1
    while (noOfNodes > 0 && Object.keys(nodeStatusMap).length < noOfNodes) {
        currNode = (currNode + 1) % noOfNodes
        let arg = markedNodes[currNode]

        // First check if the current argument is marked or not, if marked, then move on.
        if (arg.node.status && arg.node.status.length > 0) continue;
        // Can only mark an argument if a majority of the attackers are marked.
        let noOfAttackers = arg.attackers.length || 0
        let markedAttackers = 0;

        let noAttackersIn = 0
        let noAttackersOut = 0

        arg.attackers.forEach((attacker) => {
            if (nodeStatusMap[attacker.id] && nodeStatusMap[attacker.id].length > 0) {
                markedAttackers++

                if (nodeStatusMap[attacker.id] === IN) {
                    noAttackersIn++
                } else if (nodeStatusMap[attacker.id] === OUT) {
                    noAttackersOut++
                }
            }
        })

        if (markedAttackers > (noOfAttackers / 2)) {
            if (noAttackersIn === 0 && (noAttackersOut < noOfAttackers)) {
                arg.node.status = UNDECIDED
                nodeStatusMap[arg.node.id] = UNDECIDED
            } else {
                if (noAttackersOut === noOfAttackers) {
                    arg.node.status = IN
                    nodeStatusMap[arg.node.id] = IN
                } else if (noAttackersIn > 0) {
                    arg.node.status = OUT
                    nodeStatusMap[arg.node.id] = OUT
                }
            }
        }

    }
}

const getNodesWithAttackers = nodesWithLinks => {
    return nodesWithLinks.nodes.map(node => {
        let attacks = nodesWithLinks.links
        .filter(link => link.target === node.id)
        .map(attack => {
            return {
                id: attack.source
            }
        })

        return {
            node: node,
            attackers: attacks
        }
    })
}


const getNodeLabels = nodesWithLinks => {
    let nodesWithAttackers = getNodesWithAttackers(nodesWithLinks)
    let nodesToMark = JSON.parse(JSON.stringify(nodesWithAttackers)) // create a copy
    let nodeStatusMap = {}
    if (nodesWithLinks.links.length > 0) {
        markOuterMostNodes(nodesWithAttackers, nodesToMark, nodeStatusMap)
        markRemainingNodes(nodesToMark, nodeStatusMap)
    } else {
        nodeStatusMap[nodesWithLinks.nodes[0].id] = IN
    }
    return nodeStatusMap
}

module.exports = {
    getNodeLabels,
    getNodesWithAttackers
}