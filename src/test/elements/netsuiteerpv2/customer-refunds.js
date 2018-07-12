'use strict';

const suite = require('core/suite');
const payload = require('./assets/customer-refunds');
const expect = require('chakram').expect;

suite.forElement('erp', 'customer-refunds', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "ccApproved": false
      }
    }
  };
  test.withOptions(options).should.supportCrus();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  // test
  //   .withOptions({ qs: { where: 'lastModifiedDate >= \'2016-08-05T09:35:38Z\'' } })
  //   .withName('should support Ceql date search')
  //   .withValidation(r => {
  //     expect(r).to.statusCode(200);
  //     const validValues = r.body.filter(obj => obj.lastModifiedDate >= '2016-08-05T09:35:38Z');
  //     expect(validValues.length).to.equal(r.body.length);
  //   })
  //   .should.return200OnGet();
});
