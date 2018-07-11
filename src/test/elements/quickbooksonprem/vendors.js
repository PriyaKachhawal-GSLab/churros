'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/vendors.json`);
const updatePayload = { "Name": tools.random() };

suite.forElement('finance', 'vendors', { payload: payload }, (test) => {
  it('should support CRUDS for /hubs/finance/vendors', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.ListID)
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => updatePayload.EditSequence = r.body.EditSequence)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test
    .withName(`should support searching ${test.api} by Name`)
    .withOptions({ qs: { where: `Name='TEST'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.Name === `TEST`);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  test.should.supportNextPagePagination(1);
});
