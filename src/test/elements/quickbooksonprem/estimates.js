'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
suite.forElement('finance', 'estimates', (test) => {
  it('should support SR, pagination and Ceql searching for ${test.api}', () => {
    let id ;    
    return cloud.get(test.api)
    .then(r => id = r.body[0].TxnID)  
      .then(r => cloud.withOptions({ qs: { where: `TimeModified>='2017-01'` } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TxnID='${id}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`)); 
});
  test.should.supportNextPagePagination(2);
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({ qs: { where: `TimeModified='2018'` } })
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
});