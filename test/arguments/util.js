const {exists} = require('../../api/arguments/argExistsMiddleware')

require('custom-env').env('test')

const assert = require('assert')
const neo4j = require('neo4j-driver').v1

const driver = neo4j.driver(process.env.NEO_HOST, 
                            neo4j.auth.basic(process.env.NEO_USERNAME, 
                            process.env.NEO_PASS))
const session = driver.session()

let idOfExistingArgument;

describe('Utility Argument functions', () => {
    before((done) => {
        session.run('CREATE (a:Argument) RETURN ID(a)')
        .then(response => {
            let idField = response.records[0]._fields[0]
            idOfExistingArgument = JSON.stringify(neo4j.integer.toNumber(idField));
            done()
        })
    })

    after((done) => {
        // Clear the test database
        session.run('MATCH (args:Argument) DETACH DELETE (args)')
        .then(() => {
            session.close()
            done()
        })
    })

    describe('#isDeleted', () => {
        it ('should correctly identify if an arguemnt doesnt exist', (done) => {
            exists(12)
            .then(response => {
                assert.equal(response.exists, false)
                done()
            })
        })

        it ('should correctly identify an argument that does exist', (done) => {
            exists(idOfExistingArgument)
            .then(response => {
                assert.equal(response.exists, true)
                assert.equal(response.deleted, false)
                done()
            })
        })

        it ('should correctly identify an argument that was deleted', (done) => {
            session.run(`MATCH (a:Argument) 
                         WHERE ID(a) = toInteger($id)
                         SET a.deleted = true
                         RETURN ID(a)`, {id: idOfExistingArgument})
            .then(() => {
                exists(idOfExistingArgument)
                .then(response => {
                    assert.equal(response.exists, true)
                    assert.equal(response.deleted, true)
                    done()
                })
            })
        })

    })
})
                            