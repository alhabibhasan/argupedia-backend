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
    "statement": "Test arg for unit testing",
    "argumentBasis": "Position to know",
    "circumstance": "This is a test current circumstance",
    "action": "This is a test action",
    "newCircumstance": "This is a test new circumstance",
    "goal": "This is a test goal",
    "value": "This is a test value",
    "sourceList": "['www.this-is-a-test-extra-resource.com',]",
    "root": true,
    "uid": "O2rZ7n0cAN26uJOLZPam0GrGCk2",
}

let testUser = {
    uid: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2',
    displayName: 'test user',
    email: 'Test@test.com'
}

let createdPost

describe('Arguments', () => {
    before((done) => {
        let createPost = () => {
            chai.request(server)
                .post('/api/arg/create/arg')
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
            .send(testUser)
            .end((err, res) => {
                res.should.have.status(200)
                createPost()
            });
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

    describe('/VOTE', () => {
        it('should add an up vote to an argument given a valid id', (done) => {
            chai.request(server)
                .post('/api/arg/vote/up/' + createdPost.id)
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.voted.should.be.a('boolean')
                    assert.equal(res.body.voted, true)
                    done()
                });
        });

        it('should add a down vote to an argument given a valid id', (done) => {
            chai.request(server)
                .post('/api/arg/vote/down/' + createdPost.id)
                .send(testUser)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.voted.should.be.a('boolean')
                    assert.equal(res.body.voted, true)
                    done()
                });
        });

        it('should give error message and return a flag if node with ID doesnt exist', (done) => {
            chai.request(server)
                .post('/api/arg/vote/up/' + createdPost.id)
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
                .post('/api/arg/vote/down/' + createdPost.id)
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

    });
})
