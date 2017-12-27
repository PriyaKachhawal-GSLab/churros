'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/messages.json`);

suite.forElement('general', 'messages', { payload: payload } , (test) => {
  let messageId;
  it('should test CSRD /messages', () => {
  return cloud.post(test.api, payload)
   .then(r => messageId = r.body.id)
   .then(r => cloud.get(test.api))
   .then(r => cloud.get(`${test.api}/${messageId}`))
   .then(r => cloud.post(`${test.api}/${messageId}/trash`, null));
  });

  test.withApi(test.api).should.supportNextPagePagination(1);

});
