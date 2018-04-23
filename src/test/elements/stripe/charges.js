'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/charges');
const expect = require('chakram').expect;

const updateCharges = () => ({
  "receipt_email": tools.randomEmail()
});

suite.forElement('payment', 'charges', { payload: payload }, (test) => {
  test.should.supportCrs();
  it(`should allow CUS for ${test.api}`, () => {
    let chargeId;
    return cloud.post(test.api, payload)
      .then(r => chargeId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${chargeId}`, updateCharges()))
      .then(r => cloud.post(`${test.api}/${chargeId}/capture`))
      .then(r => cloud.withOptions({ qs: { where: `currency='usd' and  created=1485255289` } }).get(test.api));
  });
  
  test
    .withName(`should support searching ${test.api} by created`)
    .withOptions({ qs: { where: 'created = 1485255289' } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.created === 1485255289);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  
  test
    .withName(`should support searching ${test.api} by customer`)
    .withOptions({ qs: { where: 'customer = \'cus_CbzmZUdLk4GsA0\'' } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.customer === 'cus_CbzmZUdLk4GsA0');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
	
  test
    .withName(`should support searching ${test.api} by transfer_group`)
    .withOptions({ qs: { where: 'transfer_group = \'group_ch_1CCK6bGdZbyQGmEeC1eUPelf\'' } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.transfer_group === 'group_ch_1CCK6bGdZbyQGmEeC1eUPelf');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  test
    .withName(`should support searching ${test.api} by nested fields source.object`)
    .withOptions({ qs: { where: 'source.object = \'card\'' } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.source.object === 'card');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  
  test.should.supportPagination();
  test.should.supportNextPagePagination(1);
});
