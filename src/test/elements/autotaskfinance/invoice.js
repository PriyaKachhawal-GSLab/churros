'use strict';

const suite = require('core/suite');
const payload = require('./assets/updatePayload');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'invoices', { payload: payload }, (test) => {
  test.should.supportPagination();
  test.should.supportNextPagePagination(1);
  it(`should support CRUS and where for /hubs/crm/invoices`, () => {
    let invoiceId;
    return cloud.get('/hubs/finance/invoices')
    .then(r => {
      if (r.body.length <= 0) {
        return;
      }
      invoiceId = r.body[0].id;
      test
        .withName(`should support searching ${test.api} by invoiceId`)
        .withOptions({ qs: { where: `id = '${invoiceId}'` } })
        .withValidation((r) => {
          expect(r).to.have.statusCode(200);
          const validValues = r.body.filter(obj => obj.id = `${invoiceId}`);
          expect(validValues.length).to.equal(r.body.length);
        }).should.return200OnGet();
       return cloud.get(`${test.api}/${invoiceId}`);
      });
  });
  //skipped patch operation as delete is not supported
  it.skip(`should support RUS and where for /hubs/crm/invoices`, () => {
    let invoiceId;
    return cloud.get('/hubs/finance/invoices')
    .then(r =>  invoiceId = r.body[0].id)
    .then(r => cloud.patch(`${test.api}/${invoiceId}`, payload));
    });
});
