'use strict';
const suite = require('core/suite');
const payload = require('./assets/job-orders');
const expect = require('chakram').expect;

suite.forElement('crm', 'job-orders', { payload: payload }, (test) => {
  test.should.supportCruds();
  test
    .withOptions({ qs: { where: `dateAdded >= 1516384739657` } })
    .withName('should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => new Date(obj.dateAdded).getTime() >= 1516384739657);
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
  test.should.supportPagination('id');
});
