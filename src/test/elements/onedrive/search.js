'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

suite.forElement('documents', 'search',null, (test) => { 
     test.withOptions({ qs: { text : tools.random() } }).should.return200OnGet();
     test.should.supportNextPagePagination(1);
});
