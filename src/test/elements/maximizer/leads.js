'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const createPayload = tools.requirePayload(`${__dirname}/assets/leads-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/leads-update.json`);

suite.forElement('crm', 'leads', { payload: createPayload}, (test) => {
  it('should support CRUDS, pagination for /hubs/crm/leads', () => {
    let id, name;
    return cloud.post(test.api, createPayload)
      .then(r => {
        id = r.body.Key;
        name = r.body.FirstName;
      })
      .then(r => cloud.get(test.api))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(test.api))
      .then(r => cloud.withOptions({ qs: { where: `FirstName='${name}'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.FirstName === `${name}`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload));
      // deleted test is in beta version(vendor mes:This functionality is currently of BETA/CTP quality (not ready for production usage) 
      //.then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination('id');
});

