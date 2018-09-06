'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const queryPayload = tools.requirePayload(`${__dirname}/assets/owners-queryType.json`);

suite.forElement('crm', 'owners', (test) => {
  test.should.supportS();
  test.should.supportPagination();
  test
    .withOptions({ qs: queryPayload })
    .withName('should support email search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.email = 'email@address.com');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
