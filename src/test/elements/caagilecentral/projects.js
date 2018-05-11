'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;


suite.forElement('general', 'projects', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'State = \'Open\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.State = 'Open');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});
