const {
    getNodeLabels, 
    getNodesWithAttackers
} = require('../../../api/arguments/read/labeller')

const assert = require('assert')

let mockNodesWithLinks1 = { 
    nodes: [ 
        { id: '1' },
        { id: '2' }, 
    ],
    links : [
        { 
            source: '2', 
            target: '1', 
        }
    ]
}

let mockNodesWithLinks2 = { 
    nodes:
        [ 
            { id: '144' },
            { id: '145' },
            { id: '124' },
            { id: '146' },
            { id: '147' },
            { id: '125' },
            { id: '126' } 
        ],
    links: 
        [ 
            { source: '145', target: '144' },
            { source: '124', target: '145',},
            { source: '146', target: '124' },
            { source: '147', target: '124' },
            { source: '125', target: '144' },
            { source: '126',target: '144', } 
        ] 
}

let mockNodesWithAttackers = [
    {
        node: {id: "144"},
        attackers: [{ id: "145"}, {id: "125"}, {id: "126"}]
    }, 
    {
        node: {id: "145"},
        attackers: [{id: "124"}]
    }, 
    {
        node: {id: "124"},
        attackers: [{id: "146"}, {id: "147"}]
    }, 
    {
        node: {id: "146"},
        attackers: []
    }, 
    {
        node: {id: "147"},
        attackers: []
    }, 
    {
        node: {id: "125"},
        attackers: []
    }, 
    {
        node: {id: "126"},
        attackers: []
    }
]

describe('Labelling algorithm', () => {
    describe('#getNodeLabels', () => {
        it ('should correctly label nodes as IN or OUT #1', () => {
            let labelledNodes = getNodeLabels(mockNodesWithLinks1)
            assert.deepEqual(labelledNodes, { '1': 'OUT', '2': 'IN' })
        })

        it ('should correctly label nodes as IN or OUT #2', () => {
            let labelledNodes = getNodeLabels(mockNodesWithLinks2)
            assert.deepEqual(labelledNodes, 
                { 
                    '124': 'OUT',
                    '125': 'IN',
                    '126': 'IN',
                    '144': 'OUT',
                    '145': 'IN',
                    '146': 'IN',
                    '147': 'IN' 
                })
        })
    })

    describe('#getNodesWithAttackers', () => {
        it ('should correctly get attackers from a set of nodes and links', () => {
            let nodesWithAttackers = getNodesWithAttackers(mockNodesWithLinks2)
            assert.deepEqual(nodesWithAttackers, mockNodesWithAttackers)
        })
    })
})
