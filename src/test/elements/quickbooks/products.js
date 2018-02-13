'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/products.json`);
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'products', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "sku": tools.random(),
        "name": tools.random()
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 ,orderBy : 'name desc'} }).should.return200OnGet();
  test
    .withOptions({ qs: { where: 'type = \'SERVICE\'', page: 1, pageSize: 1, returnCount: true } })
    .withName('Test for search on type and returnCount in response')
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.type = 'SERVICE');
      expect(validValues.length).to.equal(r.body.length);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();
});
