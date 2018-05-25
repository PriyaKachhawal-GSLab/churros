'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = require('./assets/messages');

suite.forElement('messaging', 'messages', { payload: payload }, (test) => {
  it(`should allow CR for ${test.api}`, () => {
    let messageId;
    return cloud.post(test.api, payload)
      .then(r => messageId = r.body.id)
      .then(() => tools.sleep(10))		//takes some time for Mailjet to process the POST request
      .then(r => cloud.get(`${test.api}/${messageId}`));
  });
});
