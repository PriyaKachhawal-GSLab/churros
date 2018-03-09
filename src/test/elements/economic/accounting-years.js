'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('erp', 'accounting-years', (test) => {
  test.should.supportSr();
  test.should.supportNextPagePagination(1);
  test.withOptions({ qs: { where: `fromDate = '2011-01-01' ` } })
    .withName('should support Ceql fromDate search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.fromDate = '2011-01-01');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
  test.withOptions({ qs: { where: `accountNumber = 1010 ` } })
    .withName('should support Ceql accountNumber search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.accountNumber = 1010);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();


  it('should support S for /accounting-years/:year/entries', () => {
    let id, pId;
    return cloud.get(`${test.api}`)
      .then(r => id = r.body[0].id)

    .then(r => cloud.withOptions({ qs: { where: `date = '2016-12-31'` } }).get(`${test.api}/${id}/entries`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.date === '2016-12-31').length))

    .then(r => cloud.withOptions({ qs: { where: `accountNumber = '1010'` } }).get(`${test.api}/${id}/entries`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.account.accountNumber === 1010).length))
      .then(r => cloud.get(`${test.api}/${id}/totals`))
      .then(r => cloud.withOptions({ qs: { where: `accountNumber = 1010` } }).get(`${test.api}/${id}/totals`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.account.accountNumber === 1010).length))
      .then(r => cloud.get(`${test.api}/${id}/vouchers`))
      .then(r => cloud.withOptions({ qs: { where: `date = '2016-12-31'` } }).get(`${test.api}/${id}/vouchers`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.date === '2016-12-31').length))
      .then(r => cloud.withOptions({ qs: { where: `accountNumber = 1010` } }).get(`${test.api}/${id}/vouchers`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.account.accountNumber === 1010).length))
      .then(r => cloud.withOptions({ qs: { where: `accountNumber = 1010` } }).get(`${test.api}/${id}/totals`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.account.accountNumber === 1010).length))
      .then(r => cloud.get(`${test.api}/${id}/periods`))
      .then(r => pId = r.body[0].periodNumber)
      .then(r => cloud.withOptions({ qs: { where: `accountNumber = 1010` } }).get(`${test.api}/${id}/periods`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.accountingYear.year === id).length))
      .then(r => cloud.withOptions({ qs: { where: `fromDate = '2016-12-31'` } }).get(`${test.api}/${id}/periods`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.fromDate === '2016-12-31').length))
      .then(r => cloud.get(`${test.api}/${id}/periods/${pId}`))
      .then(r => cloud.get(`${test.api}/${id}/periods/${pId}/entries`))
      .then(r => cloud.withOptions({ qs: { where: `date = '2016-12-31'` } }).get(`${test.api}/${id}/periods/${pId}/entries`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.date === '2016-12-31').length))
      .then(r => cloud.withOptions({ qs: { where: `accountNumber = 1010` } }).get(`${test.api}/${id}/periods/${pId}/entries`))
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.account.accountNumber === 1010).length));
  });
});
