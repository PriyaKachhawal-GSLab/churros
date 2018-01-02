'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/./assets/tax-service.json`);

// Need to Skip because there is no delete and you dont want to
// keep creating new tax-codes
suite.forElement('finance', 'tax-service', { payload: payload, skip: true }, (test) => {
  it('should support create tax-service', () => {
    return cloud.post(test.api, payload);
  });
});
