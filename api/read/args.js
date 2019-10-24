const neo4j = require('neo4j-driver').v1

const driver = neo4j.driver(process.env.NEO_HOST, neo4j.auth.basic(process.env.NEO_USERNAME, process.env.NEO_PASS))


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

                let relationships = argument[1];

                for (var i = relationships.length - 1; i >= 0; i--) {
                    let relationStart = neo4j.integer.toNumber(relationships[i].start)
                    let relationEnd = neo4j.integer.toNumber(relationships[i].end)
                    let relationType = relationships[i].type

                    let link = {
                        source: JSON.stringify(relationStart),
                        target: JSON.stringify(relationEnd),
                        type: relationType,
                    }

                    if (!arrayContainsLink(links, link)) links.push(link);
                }


                
            })

        }

        session.close()

        return {
            nodes, links
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

module.exports = {
    getRootArgChain
}