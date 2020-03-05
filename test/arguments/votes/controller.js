require('custom-env').env('test')
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../index')
const should = chai.should();
const assert = require('assert')
const neo4j = require('neo4j-driver').v1
const sinon = require('sinon')
const jwt = require('jsonwebtoken')
const users = require('../../../api/users/users')
const userBlocked = require('../../../api/auth/userBlocked')

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

const testUser = {
    uid: "pO2rZ7n0cAN26uJOLZPam0GrGCk2",
    displayName: "test user",
    email: "Test@test.com",
    blocked: false
}

let createdPost
let jwtStub
let getUserStub
const fakeB64 = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYzZTllYThmNzNkZWExMTRkZWI5YTY0OTcxZDJhMjkzN2QwYzY3YWEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTXIgUm9ib3QiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FBdUU3bURPb3o4ZEpjRHJHX3d2Z1BpemVxVWwwVjdsZkJlQThPNm45eElDTEtvIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2Z5cC1hcmd1cGVkaWEiLCJhdWQiOiJmeXAtYXJndXBlZGlhIiwiYXV0aF90aW1lIjoxNTgxMjc0NDAwLCJ1c2VyX2lkIjoiM2hEcVNFRUJ5aU1lVjJKTGxDUXRTb2o3QWtwMiIsInN1YiI6IjNoRHFTRUVCeWlNZVYySkxsQ1F0U29qN0FrcDIiLCJpYXQiOjE1ODEzNzAxMjIsImV4cCI6MTU4MTM3MzcyMiwiZW1haWwiOiJtdWhhbW1lZGFoYXNhbkBvdXRsb29rLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA5NjUzNjk5OTk0MTg4MDg2NTczIl0sImVtYWlsIjpbIm11aGFtbWVkYWhhc2FuQG91dGxvb2suY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.rulWmxbaorpe60hyj7_rMQfFeIgK-3v57Oys5REtVb-qa4dZL2-CSVykXQUoeKhwx45lSOH8ry_z8e2L07-UEUsurnFAIWnnz7lM6jtgMFHMY6ku7ICcrgepYZfKOojV1vD5mCXsZc-sY8YzTlc4_syEWd501Chi-8Qz1llSVh9M65ryDYxTdGwJJbN784lH36oyCqlrAW_wc5wmE1cZu3f81oFWK3Ee0DlFXTgGILGdpICgfSt7TJ9TtkJaD1wEBbeXtiapUl7HURSVOgqddjSqFEGLXqctLs0jE5NFMuCHIxg9OOcuMApBXzhvXBtbYPdCzWm_OsJhbMJOZcPxhg'
const fakeSuccessTokenObject = {
    success: 'Token is valid',
    user_id: 'Fake user ID'
}
describe('Arguments', () => {

    before((done) => {
        jwtStub = sinon.stub(jwt, 'verify').callsFake(() => {
            return Promise.resolve(fakeSuccessTokenObject);
        })
        
        getUserStub = sinon.stub(users, 'getUser').callsFake(() => {
            return Promise.resolve(testUser)
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


    describe('/VOTE', () => {

        beforeEach((done) => {
            let createPost = () => {
                chai.request(server)
                    .post('/api/arg/create/arg')
                    .set('Authorization', 'Bearer ' + fakeB64) 
                    .send(testArg)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.createdNode.should.not.be.a('null')
                        createdPost = res.body.createdNode
                        done()
                    });
            }
            chai.request(server)
                .post('/api/user/create')
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    createPost()
                });
        })

        it('should add an up vote to an argument given a valid id', (done) => {
            chai.request(server)
                .post('/api/arg/vote/up/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.voted.should.be.a('string')
                    assert.equal(res.body.voted, 'UP')
                    assert.equal(res.body.argId, createdPost.id)
                    done()
                });
        });

        it('should add a down vote to an argument given a valid id', (done) => {
            chai.request(server)
                .post('/api/arg/vote/down/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.voted.should.be.a('string')
                    assert.equal(res.body.voted, 'DOWN')
                    assert.equal(res.body.argId, createdPost.id)
                    done()
                });
        });

        it('should give error message and return a flag if node with ID doesnt exist', (done) => {
            chai.request(server)
                .post('/api/arg/vote/up/1233445678987654')
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.exists.should.be.a('boolean')
                    res.body.msg.should.be.a('string')
                    assert.equal(res.body.msg, 'This argument does not exist')
                    assert.equal(res.body.exists, false)

                    done()
                });
        });

        it('should give error message and return a flag if node with ID doesnt exist', (done) => {
            chai.request(server)
                .post('/api/arg/vote/down/1234567890')
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.exists.should.be.a('boolean')
                    res.body.msg.should.be.a('string')
                    assert.equal(res.body.msg, 'This argument does not exist')
                    assert.equal(res.body.exists, false)

                    done()
                });
        });

        it('should delete the vote if the user votes in one way twice (toggle up)', (done) => {
            chai.request(server)
                .post('/api/arg/vote/up/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)

                    chai.request(server)
                        .post('/api/arg/vote/up/' + createdPost.id)
                        .set('Authorization', 'Bearer ' + fakeB64) 
                        .send(testUser)
                        .end((err, res) => {
                            res.should.have.status(200)
                            
                            res.body.voted.should.be.a('string')
                            assert.equal(res.body.voted, 'DELETED UP VOTE')
                            assert.equal(res.body.argId, createdPost.id)
                            done()
                        });
                });
        });

        it('should delete the vote if the user votes in one way twice (toggle down)', (done) => {
            chai.request(server)
                .post('/api/arg/vote/down/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)

                    chai.request(server)
                        .post('/api/arg/vote/down/' + createdPost.id)
                        .set('Authorization', 'Bearer ' + fakeB64) 
                        .send(testUser)
                        .end((err, res) => {
                            res.should.have.status(200)
                            
                            res.body.voted.should.be.a('string')
                            assert.equal(res.body.voted, 'DELETED DOWN VOTE')
                            assert.equal(res.body.argId, createdPost.id)
                            done()
                        });
                });
        });


        it('should replace up vote with down vote if you upvote and then downvote', (done) => {
            chai.request(server)
                .post('/api/arg/vote/up/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    assert.equal(res.body.voted, 'UP')
                    chai.request(server)
                        .post('/api/arg/vote/down/' + createdPost.id)
                        .set('Authorization', 'Bearer ' + fakeB64) 
                        .send(testUser)
                        .end((err, res) => {
                            res.should.have.status(200)
                            
                            res.body.voted.should.be.a('string')
                            assert.equal(res.body.voted, 'DOWN')
                            assert.equal(res.body.argId, createdPost.id)
                            done()
                        });
                });
        });

        it('should replace down vote with up vote if you downvoted and then upvote', (done) => {
            chai.request(server)
                .post('/api/arg/vote/down/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    assert.equal(res.body.voted, 'DOWN')
                    chai.request(server)
                        .post('/api/arg/vote/up/' + createdPost.id)
                        .set('Authorization', 'Bearer ' + fakeB64) 
                        .send(testUser)
                        .end((err, res) => {
                            res.should.have.status(200)
                            
                            res.body.voted.should.be.a('string')
                            assert.equal(res.body.voted, 'UP')
                            assert.equal(res.body.argId, createdPost.id)
                            done()
                        });
                });
        });

        it('should get the number of downvotes an argument has and the current users vote choice', (done) => {
            chai.request(server)
                .post('/api/arg/vote/down/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    assert.equal(res.body.voted, 'DOWN')
                    chai.request(server)
                        .post('/api/arg/vote/' + createdPost.id)
                        .set('Authorization', 'Bearer ' + fakeB64) 
                        .send(testUser)
                        .end((err, res) => {
                            assert.equal(res.body.upvotes, 0)
                            assert.equal(res.body.downvotes, 1)
                            assert.equal(res.body.userVote, 'DOWN')
                            res.should.have.status(200)
                            done()
                        });
                });
        });

        it('should get the number of upvotes an argument has and the current users vote choice', (done) => {
            chai.request(server)
                .post('/api/arg/vote/up/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    assert.equal(res.body.voted, 'UP')
                    chai.request(server)
                        .post('/api/arg/vote/' + createdPost.id)
                        .set('Authorization', 'Bearer ' + fakeB64) 
                        .send(testUser)
                        .end((err, res) => {
                            assert.equal(res.body.downvotes, 0)
                            assert.equal(res.body.upvotes, 1)
                            assert.equal(res.body.userVote, 'UP')
                            res.should.have.status(200)
                            done()
                        });
                });
        });

        it('should get the number correct of downvotes an argument has', (done) => {
            const noOfDownvotes = 24
            const downvote = (final) => {
                testUser.uid += JSON.stringify(Math.random())
                chai.request(server)
                .post('/api/arg/vote/down/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)

                    if (final) {
                        chai.request(server)
                            .post('/api/arg/vote/' + createdPost.id)
                            .set('Authorization', 'Bearer ' + fakeB64) 
                            .send(testUser)
                            .end((err, res) => {
                                res.should.have.status(200)
                                assert.equal(res.body.downvotes, noOfDownvotes)
                                done()
                            });
                    }
                })
            }
            for (let i = 0; i < noOfDownvotes; i++) downvote(i === (noOfDownvotes-1))
        });

        it('should get the number correct of upvotes an argument has', (done) => {
            const noOfUpvotes = 42
            const downvote = (final) => {
                testUser.uid += JSON.stringify(Math.random())
                chai.request(server)
                .post('/api/arg/vote/up/' + createdPost.id)
                .set('Authorization', 'Bearer ' + fakeB64) 
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)

                    if (final) {
                        chai.request(server)
                            .post('/api/arg/vote/' + createdPost.id)
                            .set('Authorization', 'Bearer ' + fakeB64) 
                            .send(testUser)
                            .end((err, res) => {
                                res.should.have.status(200)
                                assert.equal(res.body.upvotes, noOfUpvotes)
                                done()
                            });
                    }
                })
            }
            for (let i = 0; i < noOfUpvotes; i++) downvote(i === (noOfUpvotes-1))
        });

    });
})
