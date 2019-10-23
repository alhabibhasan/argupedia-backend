const express = require('express');
const router = express.Router();

const neo4j = require('neo4j-driver').v1

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'password'))

router.get('/getArgChain', (req, res, next) => {
    getRootArgChain(23)
    .then(argChain => {
        res.send({
            argChain
        })
    })
})

/**
 * Given the node ID for a root argument, this function will return the entire argument chain for that node.
 * So all nodes and relationships between nodes in two separate arrays will be returned.
 * 
 * e.g. __Nodes__: [{id: '1'}, {id: '2'}, {id: '3'}] __Links__: [{source: '1', target: '2'}]
 * @param {Integer} rootId 
 */
const getRootArgChain = (rootId) => {
    const session = driver.session()

    const cypher = `MATCH p=(rootArg:Argument{root:true})-[*]-(args:Argument) 
                    WHERE ID(rootArg) = toInteger($rootId)
                    RETURN rootArg, RELATIONSHIPS(p) AS relationship, args`
    let rootNodeChainPromise = session.run(cypher, {rootId: rootId})
  
    return Promise.all([rootNodeChainPromise])
    .then(arrayOfResults => {
        let argChainResult = arrayOfResults[0] || []
        let unwrappedChain = unwrapResult(argChainResult);
        
        let nodes = [];
        let links = [];

        if (unwrappedChain.length > 0) {

            unwrappedChain.forEach(argument => {
                let arg1 = parseArgument(argument[0])
                let arg2 = parseArgument(argument[2])

                if (!arrayContainsArg(nodes, arg1)) nodes.push(arg1)
                if (!arrayContainsArg(nodes, arg2)) nodes.push(arg2)

                let link = {
                    'source': arg2.id,
                    'target': arg1.id,
                    'type': argument[1][0].type
                }

                if(!arrayContainsLink(links, link)) links.push(link)
                
            })

        }

        // TODO: Read into how neo sends the data and fix the parsing algo to get the correct relationships

        return {
            unwrappedChain, links
        };
    })
}

const parseArgument = (arg) => {
    if (!arg) return {
        id: -1,
        statement: '(Error) Invalid arg provided during arg Parse'
    }

    let id = JSON.stringify(neo4j.integer.toNumber(arg.identity));
    let statement = arg.properties.statement;
    let root = arg.properties.root || false

    return {
        id, statement, root
    }
}

const arrayContainsArg = (arr, arg) => arr.filter(elem => elem.id === arg.id).length > 0

const arrayContainsLink = (arr, link) => arr.filter(elem => elem.source === link.source && elem.target === link.target).length > 0

const unwrapResult = response => response.records.map(rec => {
    if (rec.length === 1) {
        return rec._fields[0]
    } else if (rec.length > 1) {
        return rec._fields
    }
});

module.exports = router