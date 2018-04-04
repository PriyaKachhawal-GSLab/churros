'use strict';

const suite = require('core/suite');
const payload = require('./assets/payments');
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');

suite.forElement('finance', 'payments', { payload: payload }, (test) => {
  test.should.supportS();
  it('should allow GET for hubs/finance/payments/{id}', () => {
    let Id;
    return cloud.get(`${test.api}`)
      .then(r => {
        if (r.body && r.body.length > 0) {
          Id = r.body[0].id;
        }
      })
      .then(r => {
        if (Id)
          return cloud.get(`${test.api}/${Id}`);
      });
  });
  //Need to skip as there is no delete API
  test.withOptions({ skip: true }).should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 1 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Id and returnCount in response`)
    .withOptions({ qs: { where: `id ='1234'`, returnCount: true } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '1234');
      expect(validValues.length).to.equal(r.body.length);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();
 
    it.skip('should allow Patch for hubs/finance/payments/{id}/void', () => {
    return cloud.post(test.api,payload)
	  .then(r => cloud.patch(`${test.api}/${r.body.id}/void`))
      .then(r=>{
	     expect(r.body.privateNote).to.contain('Voided');
        });
  });
  
});
