const neo4j = require('neo4j-driver').v1

const createArgumentObject = (arg) => {
    if (!arg) return {
        id: -1,
        statement: '(Error) Invalid arg provided during arg Parse'
    }

    let id = JSON.stringify(neo4j.integer.toNumber(arg.identity));
    let statement = arg.properties.statement;
    let root = arg.properties.root || false

    if (root) return { id, statement, root }

    return {
        id, statement
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
    createArgumentObject,
    arrayContainsArg,
    arrayContainsLink,
    unwrapResult
}