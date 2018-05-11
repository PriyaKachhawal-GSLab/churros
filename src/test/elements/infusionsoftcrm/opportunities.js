'use strict';

const suite = require('core/suite');
const payload = require('./assets/opportunities');

suite.forElement('crm', 'opportunities', { payload: payload }, (test) => {
  test.should.supportCrud();
  test.withOptions({qs: { where: 'OpportunityTitle=\'Robot Test\''}}).should.return200OnGet();
});
