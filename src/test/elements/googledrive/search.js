'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;


suite.forElement('documents', 'search',null, (test) => {
     test.withOptions({ qs: { text : tools.random() } }).should.return200OnGet();
     test
         .withName(`should not support searching more than 1000 records`)
         .withOptions({ qs: { pageSize: 2,page : 501 } })
         .withValidation((r) => expect(r).to.have.statusCode(200))
         .should.return200OnGet();
     test.should.supportPagination('id');
});
