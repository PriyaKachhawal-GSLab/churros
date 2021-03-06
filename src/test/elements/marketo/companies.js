'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/companies-create.json`);
const updatedPayload = tools.requirePayload(`${__dirname}/assets/companies-update.json`);
const queryPayload = tools.requirePayload(`${__dirname}/assets/companies-requiredQueryParam-s.json`);

suite.forElement('marketing', 'companies', { payload: payload }, (test) => {
  it('should allow CRUDS for /companies', () => {
    let id;
    delete updatedPayload.externalCompanyId; //Can't update this
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => queryPayload.where = `id in ( ${id} )`)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatedPayload))
      .then(r => cloud.withOptions({ qs: queryPayload }).get(`${test.api}`))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
