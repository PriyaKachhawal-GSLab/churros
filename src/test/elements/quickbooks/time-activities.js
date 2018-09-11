'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/time-activities-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/time-activities-update.json`);
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'time-activities', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/time-activities', () => {
    let id, temp ,ID, Id;
    return cloud.post(test.api, payload)
    .then(r => {
      id = r.body.id;
       temp = id
       Id = temp.split("|");
       ID = Id[0];
      
    })
    .then(r => cloud.get(test.api))
    .then(r => cloud.withOptions({ qs: { where: `id = '${ID}'` } }).get(test.api))
    .then(r => expect(r.body.filter(o => o.id === `${id}`)).to.not.be.empty)
    .then(r => cloud.get(`${test.api}/${id}`))
    .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
    .then(r => cloud.delete(`${test.api}/${id}`));
    
  });
  test.should.supportPagination('id');

});
