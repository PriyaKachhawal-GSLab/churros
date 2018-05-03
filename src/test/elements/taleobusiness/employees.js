'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
let payload = tools.requirePayload(`${__dirname}/assets/employee.json`);

suite.forElement('humancapital', 'employees', {payload}, (test) => {
    test.should.supportNextPagePagination(1);
    test.should.supportCruds();
    it('should support where clause', () => {
        return cloud.get(test.api)
        .then(r => {
            let lastName = r.body[0].lastName;
            return cloud.withOptions({qs: { where: `lastName = '${lastName}'`}}).get(test.api)
            .then(r => expect(r.body.length).to.equal(r.body.filter(emp => emp.lastName == lastName).length))
        })
    });
});