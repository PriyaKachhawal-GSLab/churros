'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/allocations.json`);

suite.forElement('finance', 'allocations', { payload: payload }, (test) => {
  const modifiedDate = '08/14/2018 06:25:04';
  it(`should allow CRUDS for ${test.api}`, () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => cloud.get(test.api))
      .then(r => {
        id = r.body[0].RECORDNO;
        delete payload.ALLOCATIONID;
      })
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, payload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(2);
  test.withOptions({ qs: { where: `WHENMODIFIED ='${modifiedDate}'` } })
    .withName('should support Ceql WHENMODIFIED search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.WHENMODIFIED = modifiedDate);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
