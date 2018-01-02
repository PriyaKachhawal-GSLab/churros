'use strict';

const tools = require('core/tools');
const expect = require('chakram').expect;
const suite = require('core/suite');
const payload = tools.requirePayload(`${__dirname}/assets/products.json`);

suite.forElement('ecommerce', 'products', { payload: payload }, (test) => {
  test.should.supportCruds();
  // unique is "id"
  test.should.supportPagination('id');
  test
    .withName(`should support searching ${test.api} by created_date`)
    .withOptions({ qs: { where: 'after = \'2016-04-28T21:58:25\'' } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.date_created >= '2016-04-28T21:58:25');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
