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
        it('should create a new argument and then delete it', (done) => {
            chai.request(server)
                .delete('/api/arg/delete/12')
                .end((err, res) => {
                    console.log(res.body)
                    done();
                });
        })     
    });
})