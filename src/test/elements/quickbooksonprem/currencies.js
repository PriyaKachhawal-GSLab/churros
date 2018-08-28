'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/currencies-create');
const updatePayload = require('./assets/currencies-update');

suite.forElement('finance', 'currencies', { payload: payload }, (test) => {
  it(`should support CRUDS and Ceql searching for ${test.api}`, () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => {
        updatePayload.EditSequence = r.body.EditSequence;
        id = r.body.id;
      })
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { where: `ListID='${id}'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.ListID >= `${id}`)).to.not.be.empty)
      .then(r => cloud.withOptions({ qs: { where: `active='true'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.IsActive === `true`)).to.not.be.empty)
      .then(r => cloud.withOptions({ qs: { where: `TimeModified='2017-01-05'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.TimeModified >= `2017-01-05`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportNextPagePagination(1);
  it(`should return an error when 'TimeModified' filter is not a proper Date`, () => {
    return cloud.withOptions({ qs: { where: `TimeModified='2018'` } })
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
  it(`should return an error when 'active' filter is not true or false`, () => {
    return cloud.withOptions({ qs: { where: `active='isNotTrueOrFalse'` } })
      .get(test.api, (r) => expect(r).to.have.statusCode(400));
  });
});