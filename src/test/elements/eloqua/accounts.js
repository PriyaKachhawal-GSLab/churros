'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const accountCreatePayload = require('./assets/accounts-create');
const accountUpdatePayload = require('./assets/accounts-update');


suite.forElement('marketing', 'accounts', { payload: accountCreatePayload }, (test) => {
  const opts = {
    churros: {
      updatePayload: accountUpdatePayload
    }
  };
  
  test.withOptions(opts).should.supportCruds();
  test.should.supportPagination();
  test.withName(`should support searching ${test.api} by Country`)
    .withOptions({ qs: { where: `country='India'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.country = 'India');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  it('should allow GET hubs/marketing/accounts/{accountId}/membership', () => {
    let accountId;
    return cloud.get(test.api)
      .then(r => accountId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${accountId}/membership`));
  });

  it(`should allow CUD for /accounts with Eloqua field names`, () => {
    let id;
    return cloud.post(test.api, accountCreatePayload)
      .then(r => id = r.body.id)
      .then(r => cloud.patch(`${test.api}/${id}`, accountUpdatePayload))
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(Object.keys(accountUpdatePayload).every(key => r.body[key] === accountUpdatePayload[key])).to.be.true;
      })
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
