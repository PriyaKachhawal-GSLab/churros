'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
let payload = tools.requirePayload(`${__dirname}/assets/candidate.json`);

suite.forElement('humancapital', 'candidates', {payload}, (test) => {
    test.should.supportNextPagePagination(1);
    test.should.supportCruds();
    it('should support where clause', () => {
        return cloud.get(test.api)
        .then(r => {
            let lastName = r.body[0].lastName;
            return cloud.withOptions({qs: { where: `lastName = '${lastName}'`}}).get(test.api)
            .then(r => expect(r.body.length).to.equal(r.body.filter(cand => cand.lastName === lastName).length));
        });
    });
});