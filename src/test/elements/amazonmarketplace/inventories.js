'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/inventories.json`);

suite.forElement('ecommerce', 'inventories', { payload: payload }, (test) => {
  it('should allow CRUDS for inventories', () => {

    var options = {
      qs: { where: 'QueryStartDateTime=\'2016-03-16T14:32:16.50-07\'' }
    };

    let feedSubmissionId;
    return cloud.post(test.api, payload)
      .then(r => feedSubmissionId = r.body.FeedSubmissionId)
      .then(r => cloud.withOptions(options).get(test.api))
      .then(r => cloud.withOptions(options).get(`${test.api}/amazon-fulfillments`));
  });
});