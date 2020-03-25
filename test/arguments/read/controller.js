require('custom-env').env('test')
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../index')
const should = chai.should();
const assert = require('assert')
const neo4j = require('neo4j-driver').v1
const jwt = require('jsonwebtoken')
const sinon = require('sinon')
const driver = neo4j.driver(process.env.NEO_HOST, 
                            neo4j.auth.basic(process.env.NEO_USERNAME, 
                            process.env.NEO_PASS))
const getUser = require('../../../api/users/users')

chai.use(chaiHttp)

let testArg = {
    statement: 'Test arg for unit testing',
    argumentBasis: 'Position to know',
    circumstance: 'This is a test current circumstance',
    action: 'This is a test action',
    newCircumstance: 'This is a test new circumstance',
    goal: 'This is a test goal',
    value: 'This is a test value',
    sourceList: ["www.this-is-a-test-extra-resource.com"],
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

let jwtStub
let getUserStub
const fakeB64 = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYzZTllYThmNzNkZWExMTRkZWI5YTY0OTcxZDJhMjkzN2QwYzY3YWEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTXVoYW1tZWQgVGhlIEhhc2FuIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2Z5cC1hcmd1cGVkaWEiLCJhdWQiOiJmeXAtYXJndXBlZGlhIiwiYXV0aF90aW1lIjoxNTgxNDUxMDE4LCJ1c2VyX2lkIjoicE8yclo3bjBjQU4yNnVKT0xaUGFtMEdyR0NrMiIsInN1YiI6InBPMnJaN24wY0FOMjZ1Sk9MWlBhbTBHckdDazIiLCJpYXQiOjE1ODE0NTEwMTgsImV4cCI6MTU4MTQ1NDYxOCwiZW1haWwiOiJtdWhhbW1lZC5oYXNhbkBrY2wuYWMudWsiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJtdWhhbW1lZC5oYXNhbkBrY2wuYWMudWsiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.T1MEKwxPwj-Lxy8XVnjT40XSNFMz3a6QaH1Oz1w0s7sBceneih4jd20oS42T-81I6usGHANkizMoCVGNQ_nHLdFRfcQ-x63aVJrDrGYtE-34J0496n-i3fzczl2Sti0qajHUYf2nRmWM9qH2VrJ_mqerHyFeP8JWweYj2QWFoj75TJDCvMykvRhXQAp1gLwxWusiUgn02iL1uMMQTeE882lHtFur88583cvQ7ngcGOOvtCM4CRn2z9uvdTaWfEE4CY8Ys2RXwYAlQy2-L2JhWI4uvzLO0NrelkPaa3mcy2kwWknBxlx5823_uXXTHqgwuA1wmBF_AhKffASSaEPXwg'
const fakeSuccessTokenObject = {
    success: 'Token is valid',
    user_id: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2'
}


const clearDatabase = () => {
    let session = driver.session()
        // Clear the test database
        return session.run('MATCH (args) DETACH DELETE (args)')
        .then(() => {
            session.close()
        })
}
describe('Arguments', () => {
    before((done) => {
        jwtStub = sinon.stub(jwt, 'verify').callsFake(() => {
            return Promise.resolve(fakeSuccessTokenObject);
        })
        getUserStub = sinon.stub(getUser, 'getUser').callsFake(() => {
            return Promise.resolve({blocked: false})
        })
        let createPost = (final) => {
            testArg.statement = JSON.stringify(Math.random())
            chai.request(server)
                .post('/api/arg/create/arg')
                .set('Authorization', 'Bearer ' + fakeB64) 
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
                        .set('Authorization', 'Bearer ' + fakeB64) 
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
        jwtStub.restore()
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
