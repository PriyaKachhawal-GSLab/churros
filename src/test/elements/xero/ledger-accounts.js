'use strict';

const cloud = require('core/cloud.js');
const expect = require('chakram').expect;
const suite = require('core/suite');


suite.forElement('finance', 'ledger-accounts', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();
    
    it('should support RS for /ledger-accounts', () => {
        let name, accountId;

        return cloud.get(test.api)
        .then(r => accountId = r.body[0].AccountID)
        .then(() => cloud.get(`${test.api}/${accountId}`))
        .then(r => {
            expect(r.body).to.not.be.empty; 
            name = r.body.Name;
        })
        .then(() => cloud.withOptions({ qs: { where: `Name='${name}'`}}).get(test.api))
        .then(r => {
            expect(r.body.length).to.equal(1);
            expect(r.body[0].Name).to.equal(name);
        })
        .then(() => cloud.withOptions({qs: {where: `AccountID='${accountId}'`}}).get(test.api));
    });
});