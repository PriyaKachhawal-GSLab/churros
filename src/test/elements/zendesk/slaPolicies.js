'use strict';

const tools = require('core/tools');
const suite = require('core/suite');

const slaPoliciesCreatePayload = tools.requirePayload(`${__dirname}/assets/slaPolicies-create.json`);
const slaPoliciesUpdatePayload = tools.requirePayload(`${__dirname}/assets/slaPolicies-update.json`);

const options = {
 churros: {
   updatePayload: slaPoliciesUpdatePayload
 }
};

suite.forElement('helpdesk', 'slaPolicies', { payload: slaPoliciesCreatePayload, skip: false }, (test) => {
 test.withOptions(options).should.supportCruds();
 test.should.supportPagination();
});
