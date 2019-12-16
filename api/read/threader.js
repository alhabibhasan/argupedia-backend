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

const threadify = (rootNode, allNodes) => {
    if (rootNode.attacker && rootNode.attackers.length === 0) {
        return rootNode
    } else {
        rootNode.attackers = rootNode.attackers.map(attacker => {
            let fullNodeValue = allNodes.filter(arg => arg.node.id === attacker.id)
            return fullNodeValue
        })

        rootNode.attackers.forEach(attacker => {
            threadify(attacker[0], allNodes)
        })

        return rootNode
    }
}

const getThread = (nodeId, allNodes) => {
    console.log(allNodes)
    let rootNode = allNodes.filter(arg => arg.node.id == nodeId)[0]
    if (!rootNode) return 'THREAD CREATION ERROR: Root node with ID: ' + nodeId + ' not found.'
    return threadify(rootNode, allNodes)
}

module.exports = {
    getThread
}