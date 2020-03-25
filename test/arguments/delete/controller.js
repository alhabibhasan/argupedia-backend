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
    sourceList: ["www.this-is-a-test-extra-resource.com"],
    root: true,
    uid: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2',
}

let createdArgId

let jwtStub
let getUserStub
const fakeB64 = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYzZTllYThmNzNkZWExMTRkZWI5YTY0OTcxZDJhMjkzN2QwYzY3YWEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTXVoYW1tZWQgVGhlIEhhc2FuIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2Z5cC1hcmd1cGVkaWEiLCJhdWQiOiJmeXAtYXJndXBlZGlhIiwiYXV0aF90aW1lIjoxNTgxNDUxMDE4LCJ1c2VyX2lkIjoicE8yclo3bjBjQU4yNnVKT0xaUGFtMEdyR0NrMiIsInN1YiI6InBPMnJaN24wY0FOMjZ1Sk9MWlBhbTBHckdDazIiLCJpYXQiOjE1ODE0NTEwMTgsImV4cCI6MTU4MTQ1NDYxOCwiZW1haWwiOiJtdWhhbW1lZC5oYXNhbkBrY2wuYWMudWsiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJtdWhhbW1lZC5oYXNhbkBrY2wuYWMudWsiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.T1MEKwxPwj-Lxy8XVnjT40XSNFMz3a6QaH1Oz1w0s7sBceneih4jd20oS42T-81I6usGHANkizMoCVGNQ_nHLdFRfcQ-x63aVJrDrGYtE-34J0496n-i3fzczl2Sti0qajHUYf2nRmWM9qH2VrJ_mqerHyFeP8JWweYj2QWFoj75TJDCvMykvRhXQAp1gLwxWusiUgn02iL1uMMQTeE882lHtFur88583cvQ7ngcGOOvtCM4CRn2z9uvdTaWfEE4CY8Ys2RXwYAlQy2-L2JhWI4uvzLO0NrelkPaa3mcy2kwWknBxlx5823_uXXTHqgwuA1wmBF_AhKffASSaEPXwg'
const fakeSuccessTokenObject = {
    success: 'Token is valid',
    user_id: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2'
}

describe('Arguments', () => {
    before((done) => {
        let createPost = () => {
            chai.request(server)
                .post('/api/arg/create/arg')
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testArg)
                .end((err, res) => {
                    res.should.have.status(200)
                    createdArgId = res.body.createdNode.id
                    done();
                });
        }
        jwtStub = sinon.stub(jwt, 'verify').callsFake(() => {
            return Promise.resolve(fakeSuccessTokenObject);
        })
        getUserStub = sinon.stub(getUser, 'getUser').callsFake(() => {
            return Promise.resolve({blocked: false})
        })
        createPost()
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

    describe('/DELETE', () => {
        it('should successfully delete an argument that exists', (done) => {
            chai.request(server)
                .delete('/api/arg/delete/' + createdArgId)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .end((err, res) => {
                    assert.equal(res.body.deleted, true)
                    done();
                });
        })   
        
        it('should return deleted if trying to delete a deleted argument again', (done) => {
            chai.request(server)
                .delete('/api/arg/delete/' + createdArgId)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .end((err, res) => {
                    assert.equal(res.body.deleted, true)
                    assert.equal(res.body.msg, 'This message has been deleted')
                    done();
                });
        })  

        it('should give an error message if trying to delete a non existing argument', (done) => {
            chai.request(server)
                .delete('/api/arg/delete/4543534345345' )
                .set('Authorization', 'Bearer ' + fakeB64) 
                .end((err, res) => {
                    assert.equal(res.body.deleted, false)
                    assert.equal(res.body.exists, false)
                    assert.equal(res.body.msg, 'This argument does not exist')
                    done();
                });
        })  
    });
})