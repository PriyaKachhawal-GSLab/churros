'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'ledger-accounts', null, (test) => {
  it('should support SR, pagination for /hubs/finance/ledger-accounts', () => {
    let id;
    return cloud.get(test.api)
      .then(r => id = r.body[0].ListID)
      .then(r => cloud.get(`${test.api}/${id}`));
  });
  test
    .withName(`should support searching ${test.api} by Name`)
    .withOptions({ qs: { where: `Name  ='Checking'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.Name === `Checking`);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  test.should.supportNextPagePagination(1);
});
