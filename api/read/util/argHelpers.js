const neo4j = require('neo4j-driver').v1

const createArgumentObject = (arg) => {
    if (!arg) return {
        id: -1,
        statement: '(Error) Invalid arg provided during arg Parse'
    }

    let id = JSON.stringify(neo4j.integer.toNumber(arg.identity));

    let argObj = arg.properties
    argObj.id = id

    return argObj
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

const formLink = (relationship) => {
    let relationStart = neo4j.integer.toNumber(relationship.start)
    let relationEnd = neo4j.integer.toNumber(relationship.end)
    let relationType = relationship.type
    let linkedProperty = relationship.properties.respondsToProperty

    let link = {
        source: JSON.stringify(relationStart),
        target: JSON.stringify(relationEnd),
        type: relationType + ' : ' + linkedProperty,
        
    }

    return link;
}

module.exports = {
    createArgumentObject,
    arrayContainsArg,
    arrayContainsLink,
    unwrapResult,
    formLink
}