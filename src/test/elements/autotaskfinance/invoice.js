'use strict';

const suite = require('core/suite');
const payload = require('./assets/updatePayload');
const cloud = require('core/cloud');
suite.forElement('finance', 'invoices', { payload: payload }, (test) => {
  test.should.supportPagination();
  test.should.supportNextPagePagination(1);
  it(`should support CRUS, pagination and where for /hubs/crm/items`, () => {
    let invoiceId;
    return cloud.get('/hubs/finance/invoices')
      .then(r => invoiceId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${invoiceId}`))
      .then(r => cloud.patch(`${test.api}/${invoiceId}`, payload));
  })
});
