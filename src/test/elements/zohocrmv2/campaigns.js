'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;
const payload = require('./assets/campaigns');

suite.forElement('crm', 'campaigns', { payload: payload }, (test) => {
  test.should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by word`)
    .withOptions({ qs: { where: 'word=\'Test\'' } })
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => JSON.stringify(obj).toLowerCase().indexOf('test'));
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
