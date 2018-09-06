'use strict';

const tools = require('core/tools');
const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/folders-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/folders-update.json`);

suite.forElement('marketing', 'folders', { payload: payload }, (test) => {
  payload.name += tools.random();
  updatePayload.name += tools.random();
  it('It should perform CRUS for /folders', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.get(test.api))
      .then(r => cloud.get(`${test.api}/${id}`));
  });
});
