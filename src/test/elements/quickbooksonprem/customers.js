'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/customers-create');
const updatePayload = require('./assets/customers-update');

suite.forElement('finance', 'customers', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/customers', () => {
    let id;   
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.id;        
        updatePayload.EditSequence = r.body.EditSequence;
      })
      .then(r => cloud.get(test.api))      
      .then(r => cloud.withOptions({ qs: { where: `TimeModified='2017-01-05'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.TimeModified >= `2017-01-05`)).to.not.be.empty)
      .then(r => cloud.withOptions({ qs: { where: `Name='sample''s company'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.Name === `sample''s company`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}`))
       .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination('id');
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({ qs: { where: `TimeModified='2018'` } })
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
  it(`should return an error when 'active' filter is not true or false`, () => {
    return cloud.withOptions({ qs: { where: `active='isNotTrueOrFalse'` } })
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
});