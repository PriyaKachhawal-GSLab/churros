'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/opportunities');
const opportunityPatch = require('./assets/opportunitiesPatch');
const opportunityPut = require('./assets/opportunitiesPut');

suite.forElement('crm', 'opportunities', { payload }, (test) => {
let opportunityId;
  test.should.supportPagination('id');

  it(`should support CRUDS for ${test.api}`, () => {
    return cloud.post(test.api, payload)
      .then(r => opportunityId = r.body.id)
      .then(r => cloud.get(`${test.api}/${opportunityId}`))
	  .then(r => cloud.withOptions({ qs: { where: 'name=\'Post test 55\'' } }).get(test.api))
	  .then(r => expect(r).to.have.statusCode(200))
      .then(r => cloud.patch(`${test.api}/${opportunityId}`, opportunityPatch))
      .then(r => cloud.put(`${test.api}/${opportunityId}`, opportunityPut))
      .then(r => cloud.delete(`${test.api}/${opportunityId}`));
  });
});
