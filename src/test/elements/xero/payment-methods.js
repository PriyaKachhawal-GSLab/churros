'use strict';

const cloud = require('core/cloud');
const expect = require('chakram').expect;
const suite = require('core/suite');
const tools = require('core/tools');

const paymentMethodsResponse = tools.requirePayload(`${__dirname}/assets/payment-methodsResponse.json`);

suite.forElement('finance', 'payment-methods', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    it('should support GET /payment-methods', () =>{
        return cloud.get(`${test.api}`)
        .then(r => {
            expect(r.body).to.not.be.empty;
            expect(r.body).to.deep.equal(paymentMethodsResponse);
        });
    });
    
    it('should support GET /payment-methods/:id for all payment methods', () => {
        return Promise.all(
            paymentMethodsResponse.map(method => {
                return cloud.get(`${test.api}/${method.id}`)
                .then(r => {
                    expect(r.body).to.not.be.empty;
                    expect(r.body.id).to.equal(method.id);
                });       
            })
        );
    });
});