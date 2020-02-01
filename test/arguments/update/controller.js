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

    describe('/PATCH', () => {
        it('should update node with a valid id', (done) => {
            let updatedPost = JSON.parse(JSON.stringify(createdPost))
            let unitTestMessage = 'This has been updated by the unit test'
            updatedPost.statement = unitTestMessage
            updatedPost.goal = unitTestMessage + ' goal '
            chai.request(server)
                .patch('/api/arg/update/' + createdPost.id)
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
