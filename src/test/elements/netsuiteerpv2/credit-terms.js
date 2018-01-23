'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('erp', 'credit-terms', null, (test) => {
  it('should allow SR for /hubs/erp/credit-terms ', () => {
    let creditTermId;
    return cloud.get(test.api)
      .then(r => creditTermId = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 5 } }).get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { where: `internalId ='${creditTermId}'` } }).get(`${test.api}`))
      .then(r => cloud.get(`${test.api}/${creditTermId}`));
  });
});