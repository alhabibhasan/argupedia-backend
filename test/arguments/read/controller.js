require('custom-env').env('test')
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../index')
const should = chai.should();
const assert = require('assert')
const neo4j = require('neo4j-driver').v1

const driver = neo4j.driver(process.env.NEO_HOST, 
                            neo4j.auth.basic(process.env.NEO_USERNAME, 
                            process.env.NEO_PASS))

chai.use(chaiHttp)

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

let testUser = {
    uid: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2',
    displayName: 'test user',
    email: 'Test@test.com'
}

const MOCK_NODES_TO_MAKE = 10

describe('Arguments', () => {
    before((done) => {
        let createPost = (final) => {
            testArg.statement = JSON.stringify(Math.random())
            chai.request(server)
                .post('/api/arg/create/arg')
                .send(testArg)
                .end((err, res) => {
                    res.should.have.status(200)

                    let createdObjectId = res.body.createdNode.id
                    let responseArg = JSON.parse(JSON.stringify(testArg))
                    responseArg.parentId = createdObjectId
                    
                    for (let i = 0; i<MOCK_NODES_TO_MAKE;i++) {
                        chai.request(server)
                        .post('/api/arg/create/response/' + createdObjectId)
                        .send(responseArg)
                        .end((err, res) => {
                            assert.notEqual(res.body.id,'null')
                        })
                    }

                    if (final) {
                        done()
                        console.log('Done creating mock posts to get.')
                    }
                });

        }
        console.log('Creating mock posts to get')
        chai.request(server)
            .post('/api/user/create')
            .send(testUser)
            .end((err, res) => {
                res.should.have.status(200)
            });
        for (let noOfMockPost = 0; noOfMockPost < MOCK_NODES_TO_MAKE; noOfMockPost++) {
            createPost(noOfMockPost === MOCK_NODES_TO_MAKE -1)
        }
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

    describe('/GET', () => {
        it('should be able to successfully get roots and links', (done) => {
            chai.request(server)
                .get('/api/arg/read/rootArgs')
                .end((err, res) => {
                    res.should.have.status(200)
                    assert.equal(res.body.rootArgs.nodes.length, (MOCK_NODES_TO_MAKE*MOCK_NODES_TO_MAKE + MOCK_NODES_TO_MAKE))
                    assert.equal(res.body.rootArgs.links.length, (MOCK_NODES_TO_MAKE*MOCK_NODES_TO_MAKE))
                    done()
                });
        });
    });
})
