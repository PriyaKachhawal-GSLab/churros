'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/users.json`);
const usersUpdatePayload = tools.requirePayload(`${__dirname}/assets/usersUpdate.json`);

suite.forElement('finance', 'users', { payload: payload }, (test) => {
  const modifiedDate = '08/22/2016 18:50:11';
  it(`should allow CRUDS for ${test.api}`, () => {
    let userId;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.RECORDNO)
      .then(r => cloud.get(`${test.api}/${userId}`))
      .then(r => cloud.patch(`${test.api}/${userId}`, usersUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${userId}`));
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
