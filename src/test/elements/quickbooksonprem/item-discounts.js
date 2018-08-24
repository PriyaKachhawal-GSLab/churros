'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
suite.forElement('finance', 'item-discounts', (test) => {
  it('should support SR, pagination and Ceql searching for ${test.api}', () => {
    let id ;    
    return cloud.get(test.api)
    .then(r => id = r.body[0].ListID)  
      .then(r => cloud.withOptions({ qs: { where: `TimeModified>='2016-01-05'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.TimeModified >= `2016-01-05`)).to.not.be.empty)
      .then(r => cloud.withOptions({ qs: { where: `ListID='${id}'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.ListID === `${id}`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}`)); 
});
  test.should.supportNextPagePagination(1);
  test.should.supportPagination('ListID');
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({ qs: { where: `TimeModified='2018'` } })
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
});