'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'tax-rates', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });

    test.should.supportPagination();
    
    it('should support GET /tax-rates/:type', () => {
        let type;

        return cloud.get(test.api)
        .then(r => {
            expect(r.body.length).to.be.at.least(1);
            type = r.body[0].TaxType;
        })
        .then(() => cloud.get(`${test.api}/${type}`))
        .then(r => expect(r.body.TaxType).to.equal(type));
    });
    
    it('should support S for /tax-rates', () => {
        let type;

        return cloud.get(test.api)
        .then(r => {
            expect(r.body.length).to.be.at.least(1);
            type = r.body[0].TaxType;
        })
        .then(() => cloud.withOptions({qs: {where: `TaxType='${type}'`}}).get(test.api))
        .then(r => expect(r.body[0].TaxType).to.equal(type));
    });
});