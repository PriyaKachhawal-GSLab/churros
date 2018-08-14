'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/orderEntryPriceLists.json`);

suite.forElement('finance', 'order-entry-price-lists', { payload: payload }, (test) => {
  const dateTo = '12/31/2010';
  it(`should allow CRUDS for ${test.api}`, () => {
    let id;
    let name = payload.name;
    return cloud.post(test.api, payload)
      .then(r => cloud.get(test.api))
      .then(r => {
        id = r.body[0].RECORDNO;
        delete payload.name;
      })
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${name}`, payload))
      .then(r => cloud.delete(`${test.api}/${name}`));
  });
  test.should.supportNextPagePagination(2);
  test.withOptions({ qs: { where: `DATETO ='${dateTo}'` } })
    .withName('should support Ceql DATETO search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.DATETO = dateTo);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
