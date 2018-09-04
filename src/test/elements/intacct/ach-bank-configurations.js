'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/achBankConfigurations-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/achBankConfigurations-update.json`);

// Skipping this test as there are no permissions to perform CRUDS
suite.forElement('finance', 'ach-bank-configurations', { payload: payload, skip: true }, (test) => {
  const modifiedDate = '08/21/2018 07:35:34';
  it(`should allow CRUDS for ${test.api}`, () => {
    let id;
    let name = payload.achbankid;
    return cloud.post(test.api, payload)
      .then(r => cloud.get(test.api))
      .then(r => id = r.body[0].RECORDNO)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${name}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${name}`));
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
