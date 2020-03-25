require('custom-env').env('test')

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../index');
const should = chai.should();
const assert = require('assert')
const neo4j = require('neo4j-driver').v1
const jwt = require('jsonwebtoken')
const sinon = require('sinon')
const getUser = require('../../../api/users/users')

const _ = require('underscore')

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
    sourceList: ["www.this-is-a-test-extra-resource.com"],
    root: true,
    uid: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2',
}

let jwtStub
let getUserStub
const fakeB64 = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYzZTllYThmNzNkZWExMTRkZWI5YTY0OTcxZDJhMjkzN2QwYzY3YWEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTXVoYW1tZWQgVGhlIEhhc2FuIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2Z5cC1hcmd1cGVkaWEiLCJhdWQiOiJmeXAtYXJndXBlZGlhIiwiYXV0aF90aW1lIjoxNTgxNDUxMDE4LCJ1c2VyX2lkIjoicE8yclo3bjBjQU4yNnVKT0xaUGFtMEdyR0NrMiIsInN1YiI6InBPMnJaN24wY0FOMjZ1Sk9MWlBhbTBHckdDazIiLCJpYXQiOjE1ODE0NTEwMTgsImV4cCI6MTU4MTQ1NDYxOCwiZW1haWwiOiJtdWhhbW1lZC5oYXNhbkBrY2wuYWMudWsiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJtdWhhbW1lZC5oYXNhbkBrY2wuYWMudWsiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.T1MEKwxPwj-Lxy8XVnjT40XSNFMz3a6QaH1Oz1w0s7sBceneih4jd20oS42T-81I6usGHANkizMoCVGNQ_nHLdFRfcQ-x63aVJrDrGYtE-34J0496n-i3fzczl2Sti0qajHUYf2nRmWM9qH2VrJ_mqerHyFeP8JWweYj2QWFoj75TJDCvMykvRhXQAp1gLwxWusiUgn02iL1uMMQTeE882lHtFur88583cvQ7ngcGOOvtCM4CRn2z9uvdTaWfEE4CY8Ys2RXwYAlQy2-L2JhWI4uvzLO0NrelkPaa3mcy2kwWknBxlx5823_uXXTHqgwuA1wmBF_AhKffASSaEPXwg'
const fakeSuccessTokenObject = {
    success: 'Token is valid',
    user_id: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2'
}

describe('Arguments', () => {
    
    before((done) => {
        jwtStub = sinon.stub(jwt, 'verify').callsFake(() => {
            return Promise.resolve(fakeSuccessTokenObject);
        })

        getUserStub = sinon.stub(getUser, 'getUser').callsFake(() => {
            return Promise.resolve({blocked: false})
        })
        done()
    })

    after((done) => {
        jwtStub.restore()
        getUserStub.restore()
        let session = driver.session()
        // Clear the test database
        session.run('MATCH (args) DETACH DELETE (args)')
        .then(() => {
            session.close()
            done()
        })
    })

    describe('/POST', () => {
        it('should create a new argument with all required fields', (done) => {
          chai.request(server)
              .post('/api/arg/create/arg')
              .set('Authorization', 'Bearer ' + fakeB64) 
              .send(testArg)
              .end((err, res) => {
                    res.should.have.status(200);
                    
                    res.body.createdNode.should.not.equal(null)

                    let createdObjectValues = Object.keys(res.body.createdNode)
                    let sendObjectValues = Object.keys(testArg)

                    sendObjectValues.forEach(value => {
                        if (value === 'uid') {
                            assert.equal(createdObjectValues.includes('creatorUID'), true)
                        } else {
                            assert.equal(createdObjectValues.includes(value), true)
                        }

                    })
                    
                    done();
              });
        });

          it('should create a new response to an argument', (done) => {
            chai.request(server)
                .post('/api/arg/create/arg')
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testArg)
                .end((err, res) => {
                        res.should.have.status(200);
                        let createdObjectId = res.body.createdNode.id
                        let responseArg = JSON.parse(JSON.stringify(testArg))
                        responseArg.parentId = createdObjectId
                        
                        chai.request(server)
                            .post('/api/arg/create/response/' + createdObjectId)
                            .send(responseArg)
                            .end((err, res) => {
                                assert.notEqual(res.body.id,'null')
                                done()
                            })
                });
          });

          it('should not create a new response to an argument if parent ID is missing', (done) => {
            chai.request(server)
                .post('/api/arg/create/arg')
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testArg)
                .end((err, res) => {
                        res.should.have.status(200);
                        let createdObjectId = res.body.createdNode.id
                        let responseArg = JSON.parse(JSON.stringify(testArg))
                        
                        chai.request(server)
                            .post('/api/arg/create/response/' + createdObjectId)
                            .send(responseArg)
                            .end((err, res) => {
                                res.should.have.status(422);
                                done()
                            })
                });
          });


          let argFields = Object.keys(testArg)

          argFields.forEach((field, index) => {
                let testArgMissingValues = JSON.parse(JSON.stringify(testArg))
                if (field === 'sourceList') {
                    testArgMissingValues[field] = []
                } else {
                    testArgMissingValues[field] = ''
                }
                it('should successfully detect missing fields for a new argument: ' + field + '#'+ parseInt(index + 1), (done) => {
                    chai.request(server)
                        .post('/api/arg/create/arg')
                        .set('Authorization', 'Bearer ' + fakeB64) 
                        .send(testArgMissingValues)
                        .end((err, res) => {
                            if (field === 'sourceList') {
                                res.should.have.status(200);    
                            } else {
                                res.should.have.status(422);
                            }
                            done();
                        });
                })

          })

          
    });
})
