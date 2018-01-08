'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/invoices.json`);


suite.forElement('finance', 'invoices', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "docNumber": tools.random()
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.withOptions({ qs: { where: 'totalAmt = \'1\'', page: 1, pageSize: 1 } }).should.return200OnGet();

  it('should allow pdf download for /invoices', () => {
    let invoiceId;
    return cloud.post('/invoices', payload)
      .then(r => invoiceId = r.body.id)
      .then(r => cloud.withOptions({ headers: { accept: 'application/pdf' } }).get(`/invoices/${invoiceId}`))
      .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.contain('PDF');
        expect(r.response.headers['content-disposition']).to.contain('.pdf');
      })
      .then(r => cloud.delete(`/invoices/${invoiceId}`));
  });
});
