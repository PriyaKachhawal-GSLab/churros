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
  test.withOptions({ qs: { where: 'totalAmt = \'1\'', page: 1, pageSize: 1, returnCount: true } })
    .withName('Test for search on totalAmt and returnCount in response')
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.totalAmt = '1');
      expect(validValues.length).to.equal(r.body.length);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();

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
