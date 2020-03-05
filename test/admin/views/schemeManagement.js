require('custom-env').env('test')

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert')
const server = require('../../../index');
const sinon = require('sinon')

const firebaseAuth = require('../../../admin/firebase/firebase')
const schemesHelper = require('../../../admin/views/helpers/argumentSchemes')
chai.use(chaiHttp)


describe('Admin Dashboard -- Schemes', () => {
    before((done) => {
        firebaseAuth.firebase.auth = sinon.fake.returns({
            currentUser: {
            }
        })

        sinon.stub(firebaseAuth.firebase, 'database').callsFake(() => {
            return {
                ref: () => {
                    return {
                        once: () => {
                            return {
                                then: () => {
                                    return Promise.resolve([
                                        {
                                            criticalQuestions: [
                                                'The fake critical question'
                                            ]
                                        }
                                    ])
                                }
                            }
                        },
                        child: () => {
                            return {
                                push: () => {
                                    return {
                                        key: 'random key'
                                    }
                                }
                            }
                        },
                        set: () => {
                            return Promise.resolve()
                        }
                    }
                }
            }
        })

        sinon.spy(schemesHelper, 'getSchemes')
        sinon.spy(schemesHelper, 'addScheme')
        done()
    })

    after(done => {
        sinon.restore()
        done()
    })

    describe('/view', () => {
        it ('should return all schemes and CQs', done => {
            chai.request(server)
              .get('/admin/dashboard/schemes/view')
              .end((err, res) => {
                    assert(res.text.includes('The fake critical question'))
                    assert(schemesHelper.getSchemes.calledOnce)
                    res.should.have.status(200);
                    done();
              });
        })
    })

    describe('/add', () => {
        it ('should add given scheme and CQ', done => {
            chai.request(server)
              .post('/admin/dashboard/schemes/add')
              .send({scheme: `{"name":"some scheme","criticalQuestions":["x","y"]}`})
              .end((err, res) => {
                    assert(schemesHelper.addScheme.calledOnce)
                    res.should.have.status(200);
                    done();
              });
        })
    })
})