'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('crm', 'lookups', null, (test) => {
  it('should allow GET for /hubs/crm/lookups/:fieldName ', () => {
    let fieldName = 'currency';
    return cloud.withOptions({ qs: { pageSize: 5 } }).get(`${test.api}/${fieldName}`);
  });
});
