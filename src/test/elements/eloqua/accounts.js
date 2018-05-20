'use strict';

const suite = require('core/suite');
const payload = require('./assets/accounts');
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = chakram.expect;


suite.forElement('marketing', 'accounts', { payload: payload }, (test) => {
  const opts = {
    churros: {
      updatePayload: {
        name: 'Robot Test Update'
      }
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
});
