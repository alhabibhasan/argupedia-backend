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
let CREATED_NODE_IDS = []

const  getRandomInt = (min, max) =>  {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const clearDatabase = () => {
    let session = driver.session()
        // Clear the test database
        return session.run('MATCH (args:Argument) DETACH DELETE (args)')
        .then(() => {
            session.close()
        })
}
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
                    CREATED_NODE_IDS.push(createdObjectId)

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
        clearDatabase()
        .then(() => {
            for (let noOfMockPost = 0; noOfMockPost < MOCK_NODES_TO_MAKE; noOfMockPost++) {
                createPost(noOfMockPost === MOCK_NODES_TO_MAKE -1)
            }
        })
    })

    after((done) => {
        clearDatabase()
        .then(() => done())
    })

    describe('/GET', () => {
        it('should be able to successfully get roots and links', (done) => {
            chai.request(server)
                .get('/api/arg/read/rootArgs')
                .end((err, res) => {
                    res.should.have.status(200)
                    assert.equal(res.body.rootArgs.nodes.length > 0, true)
                    assert.equal(res.body.rootArgs.links.length > 0, true)
                    done()
                });
        });

        it('should be able to get a arg chain for a node with given ID', (done) => {
            const  getRandomInt = (min, max) =>  {
                min = Math.ceil(min)
                max = Math.floor(max)
                return Math.floor(Math.random() * (max - min + 1)) + min
            }

            let randomCreatedNodeID = JSON.stringify(CREATED_NODE_IDS[getRandomInt(0, CREATED_NODE_IDS.length - 1)])

            chai.request(server)
                .get('/api/arg/read/argChain/' + randomCreatedNodeID)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.argChain.nodes.should.not.be.a('null')
                    res.body.argChain.nodes.should.be.a('array')
                    res.body.argChain.links.should.not.be.a('null')
                    res.body.argChain.links.should.be.a('array')
                    done()
                });
        });

        it('should be able to get a thread for a node with given ID', (done) => {

            let randomCreatedNodeID = JSON.stringify(CREATED_NODE_IDS[getRandomInt(0, CREATED_NODE_IDS.length - 1)])

            chai.request(server)
                .get('/api/arg/read/thread/' + randomCreatedNodeID)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.thread.node.should.not.be.a('null')
                    res.body.thread.node.id.should.be.a('string')
                    res.body.thread.attackers.should.not.be.a('null')
                    res.body.thread.attackers.should.be.a('array')
                    done()
                });
        });

        it('should get an empty response when you request a non existant thread', (done) => {

            // using arbitrary large number that is not likely in test env.
            let randomCreatedNodeID = getRandomInt(10000, 40000)

            chai.request(server)
                .get('/api/arg/read/thread/' + randomCreatedNodeID)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.exists.should.be.a('boolean')
                    res.body.exists.should.be.false    
                    done()
                });
        });

        it('should get an empty response when you request a non existant chain', (done) => {

            // using arbitrary large number that is not likely in test env.
            let randomCreatedNodeID = getRandomInt(10000, 40000)

            chai.request(server)
                .get('/api/arg/read/argChain/' + randomCreatedNodeID)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.exists.should.be.a('boolean')
                    res.body.exists.should.be.false    
                    done()
                });
        });

    });
})
