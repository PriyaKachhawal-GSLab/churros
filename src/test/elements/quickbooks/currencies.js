'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/currencies-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/currencies-update.json`);
const chakram = require('chakram');
const expect = chakram.expect;


suite.forElement('finance', 'currencies', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/currencies', () => {
    let id;
    return cloud.post(test.api, payload)
    .then(r => {
      id = r.body.id;
    })
    .then(r => cloud.get(test.api))
    .then(r => cloud.withOptions({ qs: { where: `active='true'` } }).get(test.api))
    .then(r => expect(r.body.filter(o => o.active === true)).to.not.be.empty)
    .then(r => cloud.get(`${test.api}/${id}`))
    .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
    .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination('id');
});
