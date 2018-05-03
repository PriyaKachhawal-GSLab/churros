'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
let payload = tools.requirePayload(`${__dirname}/assets/account.json`);

suite.forElement('humancapital', 'accounts', {payload}, (test) => {
    test.should.supportNextPagePagination(1);
    test.should.supportCruds();
    it('should support where clause', () => {
        return cloud.get(test.api)
        .then(r => {
            let name = r.body[0].name;
            return cloud.withOptions({qs: { where: `name = '${name}'`}}).get(test.api)
            .then(r => expect(r.body.length).to.equal(r.body.filter(acct => acct.name == name).length))
        })
    });
});