'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/journalVouchers.json`);


suite.forElement('erp', 'journals',{ payload: payload }, (test) => {
  let jpgFile = __dirname + '/assets/brady.jpg';
  test.should.supportSr();
  test.should.supportNextPagePagination(1);
  test.withOptions({ qs: { where: `name = 'madhuri' ` } })
     .withName('should support Ceql name search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.name = 'madhuri');
       expect(validValues.length).to.equal(r.body.length);
     }).should.return200OnGet();

     it.skip('should support S for /journals/:id/entires, /journals/:id/vouchers and CSD for /journals/:id/accountingYear:year/vouchers/id/attachments  ', () => {
       let id,vId,year;
       return cloud.get(`${test.api}`)
         .then(r => id = r.body[0].id)
         .then(r => cloud.get(`${test.api}/${id}/entries`))
         .then(r => cloud.get(`${test.api}/${id}/vouchers`))
         .then(r => cloud.post(`${test.api}/${id}/vouchers`,payload))
         .then(r =>   {
           vId = r.body.voucherNumber;
           year = r.body.accountingYear.year;
         })
         .then(r => cloud.get(`/hubs/erp/journals/${id}/accounting-years/${year}/vouchers/${vId}`))
         .then(r => cloud.postFile(`/hubs/erp/journals/${id}/accounting-years/${year}/vouchers/${vId}/attachments`,jpgFile))
         .then(r => cloud.get(`/hubs/erp/journals/${id}/accounting-years/${year}/vouchers/${vId}/attachments`))
         .then(r => cloud.get(`/hubs/erp/journals/${id}/accounting-years/${year}/vouchers/${vId}/attachments/metadata`))
         .then(r => cloud.delete(`/hubs/erp/journals/${id}/accounting-years/${year}/vouchers/${vId}/attachments`));

     });
});
