'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/customers.json`);

suite.forElement('payment', 'customers', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  it('should support Ceql email search', () => {
    return cloud.withOptions({ qs: { where: `email = 'string@test.com'` } }).get(test.api)
      .then(r => {
        const validValues = r.body.filter(obj => obj.email = 'string@test.com');
        expect(validValues.length).to.equal(r.body.length);
      });
  });
});
