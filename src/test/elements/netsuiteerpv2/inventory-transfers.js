'use strict';

const suite = require('core/suite');
const payload = require('./assets/inventory-transfers');
const expect = require('chakram').expect;

suite.forElement('erp', 'inventory-transfers', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test
    .withOptions({ qs: { where: `lastModifiedDate >= '2014-01-15T00:00:00.000Z'` } })
    .withName('should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => new Date(obj.lastModifiedDate).getTime() >= 1389744000000); //2014-01-15T00:00:00.000Z7 is equivalent to 1389744000000
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
