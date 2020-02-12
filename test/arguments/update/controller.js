require('custom-env').env('test')
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../index')
const should = chai.should();
const assert = require('assert')
const neo4j = require('neo4j-driver').v1
const jwt = require('jsonwebtoken');
const sinon = require('sinon')

const driver = neo4j.driver(process.env.NEO_HOST, 
                            neo4j.auth.basic(process.env.NEO_USERNAME, 
                            process.env.NEO_PASS))

chai.use(chaiHttp)

let testArg = {
    "statement": "Test arg for unit testing",
    "argumentBasis": "Position to know",
    "circumstance": "This is a test current circumstance",
    "action": "This is a test action",
    "newCircumstance": "This is a test new circumstance",
    "goal": "This is a test goal",
    "value": "This is a test value",
    "sourceList": "['www.this-is-a-test-extra-resource.com',]",
    "root": true,
    "uid": "pO2rZ7n0cAN26uJOLZPam0GrGCk2",
}

let testUser = {
    uid: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2',
    displayName: 'test user',
    email: 'Test@test.com'
}

let createdPost

let stub
const fakeB64 = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYzZTllYThmNzNkZWExMTRkZWI5YTY0OTcxZDJhMjkzN2QwYzY3YWEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTXIgUm9ib3QiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FBdUU3bURPb3o4ZEpjRHJHX3d2Z1BpemVxVWwwVjdsZkJlQThPNm45eElDTEtvIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2Z5cC1hcmd1cGVkaWEiLCJhdWQiOiJmeXAtYXJndXBlZGlhIiwiYXV0aF90aW1lIjoxNTgxMjc0NDAwLCJ1c2VyX2lkIjoiM2hEcVNFRUJ5aU1lVjJKTGxDUXRTb2o3QWtwMiIsInN1YiI6IjNoRHFTRUVCeWlNZVYySkxsQ1F0U29qN0FrcDIiLCJpYXQiOjE1ODEzNzAxMjIsImV4cCI6MTU4MTM3MzcyMiwiZW1haWwiOiJtdWhhbW1lZGFoYXNhbkBvdXRsb29rLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA5NjUzNjk5OTk0MTg4MDg2NTczIl0sImVtYWlsIjpbIm11aGFtbWVkYWhhc2FuQG91dGxvb2suY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.rulWmxbaorpe60hyj7_rMQfFeIgK-3v57Oys5REtVb-qa4dZL2-CSVykXQUoeKhwx45lSOH8ry_z8e2L07-UEUsurnFAIWnnz7lM6jtgMFHMY6ku7ICcrgepYZfKOojV1vD5mCXsZc-sY8YzTlc4_syEWd501Chi-8Qz1llSVh9M65ryDYxTdGwJJbN784lH36oyCqlrAW_wc5wmE1cZu3f81oFWK3Ee0DlFXTgGILGdpICgfSt7TJ9TtkJaD1wEBbeXtiapUl7HURSVOgqddjSqFEGLXqctLs0jE5NFMuCHIxg9OOcuMApBXzhvXBtbYPdCzWm_OsJhbMJOZcPxhg'
const fakeSuccessTokenObject = {
    success: 'Token is valid',
    user_id: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2'
}

describe('Arguments', () => {
    before((done) => {
        stub = sinon.stub(jwt, 'verify').callsFake(() => {
            return Promise.resolve(fakeSuccessTokenObject);
        })

        let createPost = () => {
            chai.request(server)
                .post('/api/arg/create/arg')
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testArg)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.createdNode.should.not.be.a('null')
                    createdPost = res.body.createdNode

                    console.log('Created mock posts to edit')
                    done()
                });
        }
        console.log('Creating mock posts to edit')
        chai.request(server)
            .post('/api/user/create')
            .set('Authorization', 'Bearer ' + fakeB64) 
            .send(testUser)
            .end((err, res) => {
                res.should.have.status(200)
                createPost()
            });
    })

    after((done) => {
        sinon.restore()
        let session = driver.session()
        // Clear the test database
        session.run('MATCH (args) DETACH DELETE (args)')
        .then(() => {
            session.close()
            done()
        })
    })

    describe('/PATCH', () => {
        it('should update node with a valid id', (done) => {
            let updatedPost = JSON.parse(JSON.stringify(createdPost))
            let unitTestMessage = 'This has been updated by the unit test'
            updatedPost.statement = unitTestMessage
            updatedPost.goal = unitTestMessage + ' goal '
            chai.request(server)
                .patch('/api/arg/update/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(updatedPost)
                .end((err, res) => {
                    res.should.have.status(200)
                    assert.equal(res.body.updatedArg.statement, unitTestMessage)
                    assert.equal(res.body.updatedArg.goal, unitTestMessage + ' goal ')
                    done()
                });
        });

        it('should return error message if node doesnt exist', (done) => {
            let updatedPost = JSON.parse(JSON.stringify(createdPost))
            let unitTestMessage = 'This has been updated by the unit test'
            updatedPost.statement = unitTestMessage
            updatedPost.goal = unitTestMessage + ' goal '
            chai.request(server)
                .patch('/api/arg/update/12334566778')
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(updatedPost)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.exists.should.be.a('boolean')
                    res.body.msg.should.be.a('string')
                    assert.equal(res.body.msg, 'This argument does not exist')
                    assert.equal(res.body.exists, false)
                    done()
                });
        });
    });
})
