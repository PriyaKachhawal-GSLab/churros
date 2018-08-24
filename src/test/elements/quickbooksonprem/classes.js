'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
suite.forElement('finance', 'classes', null, (test) => {
  it('should support SR and Ceql search for /hubs/finance/classes', () => {
    let id;
    
    return cloud.get(test.api)
      .then(r => id = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { where: `Name='Expense'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.Name === `Expense`)).to.not.be.empty)
      .then(r => cloud.withOptions({ qs: { where: `isactive='true'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.IsActive === `true`)).to.not.be.empty)
      .then(r => cloud.withOptions({ qs: { where: `TimeModified>='2015-05-01'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.TimeModified >= `2015-05-01`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}`));
  });  
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({qs: {where: `TimeModified='2018'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
  it(`should return an error when 'active' filter is not true or false`, () => {
    return cloud.withOptions({qs: {where: `active='isNotTrueOrFalse'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
  test.should.supportPagination('id');
});

