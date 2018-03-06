'use strict';

const tools = require('core/tools');
const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/products.json`);

suite.forElement('ecommerce', 'products', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination('id');

  it(`should support searching ${test.api} by created_date`, () => {
    let results;
    return cloud.withOptions({ qs: { where: `after = '2016-04-28T21:58:25'` } }).get(test.api)
      .then(r => {
        results = r.body.filter(obj => obj.date_created >= '2016-04-28T21:58:25');
        expect(results.length).to.equal(r.body.length);
      })
      .then(r => cloud.withOptions({ qs: { where: `created_date > '2016-04-28T21:58:25'` } }).get(test.api))
      .then(r => {
        const validValues = r.body.filter(obj => obj.date_created >= '2016-04-28T21:58:25');
        expect(validValues.length).to.equal(r.body.length);
        expect(validValues.length).to.equal(results.length);
      });
  });
});
