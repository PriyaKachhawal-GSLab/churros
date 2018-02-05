'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
suite.forElement('finance', 'budgets', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  test.withApi(test.api)
    .withOptions({ qs: { where: "active='true'" } })
    .withValidation(r => expect(r.body.filter(obj => obj.active === true)).to.not.be.empty)
    .withName('should allow GET with option active')
    .should.return200OnGet();
});
