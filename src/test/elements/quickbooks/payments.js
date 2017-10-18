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
          cloud.get(`${test.api}/${Id}`);
        else{
             cloud.get(`${test.api}/${Id}`,null,
        r => {
          (expect(r).to.have.statusCode(400)); });
            }
         });
  });
//Need to skip as there is no delete API
  test.withOptions({skip:true}).should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 1 } }).should.return200OnGet();
  test.withName(`should support searching ${test.api} by Id`)
    .withOptions({ qs: { where: `id ='1234'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.id = '1234');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

});
