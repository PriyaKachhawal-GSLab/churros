'use strict';

const tools = require('core/tools');
const suite = require('core/suite');
const payload = tools.requirePayload(`${__dirname}/assets/slaPolicies.json`);

const options = {
 churros: {
   updatePayload: {
     "title": "20Sep2017zz"
   }
 }
};

suite.forElement('helpdesk', 'slaPolicies', { payload: payload, skip: false }, (test) => {
 test.withOptions(options).should.supportCruds();
 test.should.supportPagination();
});
