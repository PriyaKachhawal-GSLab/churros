'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const subscriptionPayload = tools.requirePayload(`${__dirname}/assets/subscriptions.json`);

suite.forElement('payment', 'subscriptions', { payload: subscriptionPayload }, (test) => {
  test.withOptions({ qs: { where: 'direction=\'desc\'' } }).should.return200OnGet();

  it(`should allow SR for ${test.api}`, () => {
    let subscriptionId;
    return cloud.get(test.api)
      .then(r => subscriptionId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${subscriptionId}`));
  });
  // skipping because no deleting subscriptions doesn't actually deletes
  it.skip(`should allow POST for ${test.api}`, () => {
    return cloud.post(test.api, subscriptionPayload);
  });
  test.should.supportPagination();
});
