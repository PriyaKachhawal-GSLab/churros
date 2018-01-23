'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = require('./assets/estimates');

suite.forElement('finance', 'estimates', { payload: payload }, (test) => {
  test.should.supportCrds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test.withOptions({ qs: { where: 'totalAmt = \'1\'', page: 1, pageSize: 1 } }).should.return200OnGet();

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
