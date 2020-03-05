const assert = require('assert')
const httpMocks = require('node-mocks-http');
const {jwtAuthMiddleware} = require('../../api/auth/jwtVerify')

describe('JWT Token Verification', () =>{
    describe('Middleware' , () => {
        it ('should detect if no auth token has been sent by the user', (done) => {
            let request  = httpMocks.createRequest({
                method: 'GET'
            });
         
            let response = httpMocks.createResponse();

            jwtAuthMiddleware(request, response)
            done()
        })
    })
})