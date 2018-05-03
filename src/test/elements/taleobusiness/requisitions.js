'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
let payload = tools.requirePayload(`${__dirname}/assets/requisition.json`);

suite.forElement('humancapital', 'requisitions', {payload}, (test) => {
    test.should.supportNextPagePagination(1);
    test.should.supportCruds();
    it('should support where clause', () => {
        return cloud.get(test.api)
        .then(r => {
            let title = r.body[0].title;
            return cloud.withOptions({qs: { where: `title = '${title}'`}}).get(test.api)
            .then(r => expect(r.body.length).to.equal(r.body.filter(req => req.title == title).length))
        })
    });
});