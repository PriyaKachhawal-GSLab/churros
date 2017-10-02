'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const financialReportsPayload = require('./assets/financial-reports');

suite.forElement('finance', 'financial-reports',{ payload:financialReportsPayload } , (test) => {
    test.should.supportCruds();
    test.should.supportPagination();
    test
      .withName(`should support searching ${test.api} by Name`)
      .withOptions({ qs: { where: `Name  ='test'` } })
      .withValidation((r) => {
        expect(r).to.have.statusCode(200);
        const validValues = r.body.filter(obj => obj.Name === 'test');
        expect(validValues.length).to.equal(r.body.length);
      }).should.return200OnGet();
    });
