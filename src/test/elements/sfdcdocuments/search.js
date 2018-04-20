'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

suite.forElement('documents', 'search', null, (test) => {

  test.should.supportPagination();

  test.should.supportNextPagePagination(1);

  test.withOptions({ qs: { path: '/' } })
    .should.return200OnGet();

  test.withOptions({ qs: { startDate: '2015-06-15T09:15:04Z', endDate: '2015-06-15T09:40:04Z' } })
    .should.return200OnGet();

  test.withOptions({ qs: { path: '/Test folder',text: tools.random() } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(400);
    });
});
