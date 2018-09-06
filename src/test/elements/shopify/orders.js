'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/orders-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/orders-update.json`);

suite.forElement('ecommerce', 'orders', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  it('should allow GET for /orders with use of the `orderBy` parameter', () => {
    return cloud.withOptions({ qs: { orderBy: 'updated_at' } }).get(test.api)
      .then(r => cloud.withOptions({ qs: { orderBy: 'created_at' } }).get(test.api));
  });
});
