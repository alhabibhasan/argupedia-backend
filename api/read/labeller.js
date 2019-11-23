let nodes = [
    { 
        node: {
            id: '37',
        },
        attackers: [
                {
                    id: '38',
                },
                {
                    id: '39',
                },
            ] 
    },
    { 
        node: {
            id: '38',
        },
        attackers: [] 
    },
    { 
        node: {
            id: '39',
        },
        attackers: [
                {
                    id: '58',
                },
                {
                    id: '23',
                },
        ] 
    },
    { 
        node: {
            id: '58',
        },
        attackers: [] 
    },
    { 
        node: {
            id: '23',
        },
        attackers: [
            {
                id: '100',
            },
            {
                id: '101',
            },
        ] 
    },
    { 
        node: {
            id: '100',
        },
        attackers: [
            {
                id: '102',
            },
        ] 
    },
    { 
        node: {
            id: '101',
        },
        attackers: [
            {
                id: '103',
            },
        ] 
    },
    { 
        node: {
            id: '102',
        },
        attackers: [
        ] 
    },
    { 
        node: {
            id: '103',
        },
        attackers: [
            {
                id: '104',

            },
            {
                id: '105',
            },
        ] 
    },
    { 
        node: {
            id: '104',
        },
        attackers: [
            {
                id: '107',
            },
            {
                id: '108',
            },
            {
                id: '109',
            },
            {
                id: '110',
            },
        ] 
    },
    { 
        node: {
            id: '105',
        },
        attackers: [
        ] 
    },
    { 
        node: {
            id: '107',
        },
        attackers: [
        ] 
    },
    { 
        node: {
            id: '108',
        },
        attackers: [
        ] 
    },
    { 
        node: {
            id: '109',
        },
        attackers: [
        ] 
    },
    { 
        node: {
            id: '110',
        },
        attackers: [
            {
                id: '111',

            },
        ] 
    },
    { 
        node: {
            id: '111',
        },
        attackers: [
        ] 
    },
]

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
            if (noAttackersOut > noAttackersIn) {
                arg.node.status = IN
                nodeStatusMap[arg.node.id] = IN
            } else if (noAttackersIn > noAttackersOut) {
                arg.node.status = OUT
                nodeStatusMap[arg.node.id] = OUT
            } else {
                arg.node.status = UNDECIDED
                nodeStatusMap[arg.node.id] = UNDECIDED
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
            node: {
                id: node.id
            },
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
    getNodeLabels
}