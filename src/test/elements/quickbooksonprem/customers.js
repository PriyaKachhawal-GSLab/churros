'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
<<<<<<< HEAD
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/customers.json`);
const updatePayload = { "FirstName": tools.random(), "FullName": tools.random() };
=======
const payload = require('./assets/customers-create');
const updatePayload = require('./assets/customers-update');
>>>>>>> master

suite.forElement('finance', 'customers', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/customers', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.id;
        updatePayload.EditSequence = r.body.EditSequence;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `ListID='${id}'` } }).get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination();
  it('should support S and Ceql searching for /hubs/finance/customers', () => {    
    return cloud.get(test.api)
      .then(r => cloud.withOptions({ qs: { where: `Name='sample''s company'`} }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `active='true'` } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `TimeModified='2018-05'` } }).get(test.api));
      
  });
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({qs: {where: `TimeModified='2018'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
  it(`should return an error when 'active' filter is not true or false`, () => {
    return cloud.withOptions({qs: {where: `active='isNotTrueOrFalse'`}})
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
});