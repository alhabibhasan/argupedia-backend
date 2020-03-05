require('custom-env').env('test')

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert')
const server = require('../../../index');
const sinon = require('sinon')
const userHelper = require('../../../admin/views/helpers/users')
const userOps = require('../../../api/users/users')

const firebaseAuth = require('../../../admin/firebase/firebase')

describe('Admin Dashboard -- Users', () => {
    before(done => {
        firebaseAuth.firebase.auth = sinon.fake.returns({
            currentUser: {
            }
        })
        sinon.stub(userOps, 'setUserBlock').callsFake((userId, block) => {
            return Promise.resolve({blocked: block})
        })
        sinon.spy(userHelper, 'getAllUsers')
        done()
    })
    describe('/users', () => {
        it ('should return all users', done => {
            chai.request(server)
              .get('/admin/dashboard/users/')
              .end((err, res) => {
                    assert(userHelper.getAllUsers.calledOnce)
                    res.should.have.status(200);
                    done();
              });
        })

        it ('should block user with id', done => {
            chai.request(server)
              .get('/admin/dashboard/users/block/123242')
              .end((err, res) => {
                    res.should.have.status(200);
                    done();
              });
        })

        it ('should unblock user with id', done => {
            chai.request(server)
              .get('/admin/dashboard/users/unblock/123242')
              .end((err, res) => {
                    res.should.have.status(200);
                    done();
              });
        })
    })
})
