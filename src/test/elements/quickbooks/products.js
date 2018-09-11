'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/products-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/products-update.json`);
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = chakram.expect;

suite.forElement('finance', 'products', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/products', () => {
    let id, types;
    return cloud.post(test.api, payload)
    .then(r => {
      id = r.body.id;
      types=r.body.type;
    })
    .then(r => cloud.get(test.api))
    .then(r => cloud.withOptions({ qs: { where: `type = '${types}'` } }).get(test.api))
    .then(r => expect(r.body.filter(o => o.type === `${types}`)).to.not.be.empty)
    .then(r => cloud.get(`${test.api}/${id}`))
    .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
    .then(r => cloud.delete(`${test.api}/${id}`));
  });
  test.should.supportPagination('id');
});

