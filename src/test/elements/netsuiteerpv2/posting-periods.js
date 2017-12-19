'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('erp', 'posting-periods', (test) => {
  test.should.supportSr();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  test.withOptions({ qs: { where: 'periodName=\'Feb 2002\'' } })
    .withValidation(r => {
      const validValues = r.body.filter(obj =>
        obj.periodName === 'Feb 2002');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
