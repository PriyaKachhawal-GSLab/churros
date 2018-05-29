'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

let updatePayload = {
  "IndustryCode1": "0001"
};

suite.forElement('erp', 'customers', { }, (test) => {

  // test.should.supportSr();
  // test.withOptions({ qs: { where: 'Customer=\'21\'' } }).should.return200OnGet(); 
  // test.should.supportPagination();


  it('should support Update for customers', () => {
    let customerId;
    return cloud.get(`${test.api}`)
        .then(r => {
          expect(r.body).to.not.be.empty;
          customerId = r.body[0].id;          
        })
      .then(r => cloud.patch(`${test.api}/${customerId}`, updatePayload));
  });
});


