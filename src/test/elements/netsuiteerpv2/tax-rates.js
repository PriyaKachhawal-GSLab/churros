'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('erp', 'tax-rates', null, (test) => {
  it('should allow SR for /hubs/erp/tax-rates ', () => {
    let taxRateId;
    return cloud.get(test.api)
      .then(r => taxRateId = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 5 } }).get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { where: `id ='${taxRateId}'` } }).get(`${test.api}`))
      .then(r => cloud.get(`${test.api}/${taxRateId}`));
  });
});
