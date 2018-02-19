'use strict';

const suite = require('core/suite');
const payload = require('./assets/billing-accounts');

suite.forElement('erp', 'billing-accounts', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
  test
    .withOptions({ qs: { where: `startDate >= '2014-01-15T00:00:00.000Z'` } })
    .withName('should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => new Date(obj.startDate).getTime() >= 1389744000000); //2014-01-15T00:00:00.000Z7 is equivalent to 1389744000000
      expect(validValues.length).to.equal(r.body.length);
    })
});
