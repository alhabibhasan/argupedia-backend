require('custom-env').env('test')

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../../index');
const should = chai.should();
const assert = require('assert')
const neo4j = require('neo4j-driver').v1

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
    sourceList: '["www.this-is-a-test-extra-resource.com"]',
    root: true,
    uid: 'pO2rZ7n0cAN26uJOLZPam0GrGCk2',
}

describe('Arguments', () => {
    after((done) => {
        let session = driver.session()
        // Clear the test database
        session.run('MATCH (args:Argument) DETACH DELETE (args)')
        .then(() => {
            session.close()
            done()
        })
    })

    describe('/POST', () => {
        it('should create a new argument with all required fields', (done) => {
          chai.request(server)
              .post('/api/arg/create/arg')
              .send(testArg)
              .end((err, res) => {
                    res.should.have.status(200);
                    
                    res.body.createdNode.should.not.equal(null)

                    let createdObjectValues = Object.values(res.body.createdNode)
                    let sendObjectValues = Object.values(testArg).sort()
                    let intersection = _.intersection(createdObjectValues, sendObjectValues).sort()
                    
                    JSON.stringify(intersection).should.equal(JSON.stringify(sendObjectValues))
                    
                    done();
              });
        });

          it('should create a new response to an argument', (done) => {
            chai.request(server)
                .post('/api/arg/create/arg')
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
                testArgMissingValues[field] = ''
                it('should successfully detect missing fields for a new argument: ' + field + '#'+ parseInt(index + 1), (done) => {
                    chai.request(server)
                        .post('/api/arg/create/arg')
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
