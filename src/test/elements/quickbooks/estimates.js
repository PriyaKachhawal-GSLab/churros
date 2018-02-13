'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/estimates');

suite.forElement('finance', 'estimates', { payload: payload }, (test) => {
  test.should.supportCrds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.withOptions({ qs: { where: 'totalAmt = \'1\'', page: 1, pageSize: 1, returnCount: true } })
    .withName('Test for search on totalAmt and returnCount in response')
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.totalAmt = '1');
      expect(validValues.length).to.equal(r.body.length);
      expect(r.response.headers['elements-total-count']).to.exist;
    }).should.return200OnGet();

  it('should allow pdf download for /estimates', () => {
    let estimateId;
    return cloud.post('/estimates', payload)
      .then(r => estimateId = r.body.id)
      .then(r => cloud.withOptions({ headers: { accept: 'application/pdf' } }).get(`/estimates/${estimateId}`))
      .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.contain('PDF');
        expect(r.response.headers['content-disposition']).to.contain('.pdf');
      })
      .then(r => cloud.delete(`/estimates/${estimateId}`));
  });
});
