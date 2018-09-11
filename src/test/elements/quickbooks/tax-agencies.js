'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/tax-agencies-create.json`);
const chakram = require('chakram');
const expect = chakram.expect;

suite.forElement('finance', 'tax-agencies', { payload: payload }, (test) => {
  it('should support CRUDS and Ceql searching for /hubs/finance/tax-agencies', () => {
    let id;
    return cloud.post(test.api, payload)
    .then(r => {
      id = r.body.id;
      var Id = id.split("|");
      id = Id[0];
      
    })
    .then(r => cloud.get(test.api))
    .then(r => cloud.withOptions({ qs: { where: `id = '${id}'` } }).get(test.api))
    .then(r => expect(r.body.filter(o => o.id === `${id}`)).to.not.be.empty)
    .then(r => cloud.get(`${test.api}/${id}`));
    
  });
  test.should.supportPagination('id');

});
