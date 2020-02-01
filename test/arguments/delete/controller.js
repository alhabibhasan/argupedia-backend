require('custom-env').env('test')

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../index');
const should = chai.should();
const assert = require('assert')
const neo4j = require('neo4j-driver').v1

const driver = neo4j.driver(process.env.NEO_HOST, 
                            neo4j.auth.basic(process.env.NEO_USERNAME, 
                            process.env.NEO_PASS))

let testArg = {
    statement: 'Test arg for unit testing',
    argumentBasis: 'Position to know',
    circumstance: 'This is a test current circumstance',
    action: 'This is a test action',
    newCircumstance: 'This is a test new circumstance',
    goal: 'This is a test goal',
    value: 'This is a test value',
    sourceList: '["www.this-is-a-test-extra-resource.com"]',
    root: true,
    uid: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2',
}

let createdArgId

describe('Arguments', () => {
    before((done) => {
        let createPost = () => {
            chai.request(server)
                .post('/api/arg/create/arg')
                .send(testArg)
                .end((err, res) => {
                    res.should.have.status(200)
                    createdArgId = res.body.createdNode.id
                    done();
                });
        }
        createPost()
    })

    after((done) => {
        let session = driver.session()
        // Clear the test database
        session.run('MATCH (args:Argument) DETACH DELETE (args)')
        .then(() => {
            session.close()
            done()
        })
    })

    describe('/DELETE', () => {
        it('should successfully delete an argument that exists', (done) => {
            chai.request(server)
                .delete('/api/arg/delete/' + createdArgId)
                .end((err, res) => {
                    assert.equal(res.body.deleted, true)
                    done();
                });
        })   
        
        it('should return deleted if trying to delete a deleted argument again', (done) => {
            chai.request(server)
                .delete('/api/arg/delete/' + createdArgId)
                .end((err, res) => {
                    assert.equal(res.body.deleted, true)
                    assert.equal(res.body.msg, 'This message has been deleted')
                    done();
                });
        })  

        it('should give an error message if trying to delete a non existing argument', (done) => {
            chai.request(server)
                .delete('/api/arg/delete/4543534345345' )
                .end((err, res) => {
                    assert.equal(res.body.deleted, false)
                    assert.equal(res.body.exists, false)
                    assert.equal(res.body.msg, 'This argument does not exist')
                    done();
                });
        })  
    });
})