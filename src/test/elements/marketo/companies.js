'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/companies.json`);
const cloud = require('core/cloud');

suite.forElement('marketing', 'companies', { payload: payload }, (test) => {
  it('should allow CRUDS for /companies', () => {
    let id, value;
    const updatedPayload = tools.requirePayload(`${__dirname}/assets/companies.json`);
    delete updatedPayload.externalCompanyId; //Can't update this
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => value = `id in ( ${id} )`)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatedPayload))
      .then(r => cloud.withOptions({ qs: { where: `${value}` } }).get(`${test.api}`))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
