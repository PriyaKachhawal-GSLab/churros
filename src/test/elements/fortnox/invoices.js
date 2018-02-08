'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/invoice.json`);

suite.forElement('finance', 'invoices', { payload: payload }, (test) => {
  test.should.supportCruds();
  test
    .withOptions({ qs: { where: 'ocr = \'133\'' } })
    .withName('should support search by OCR')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.OCR = '133');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination();
});
