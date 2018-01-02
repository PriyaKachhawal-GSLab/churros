'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/equipment-cards.json`);

suite.forElement('erp', 'equipment-cards', { payload: payload}, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('ItemCode');
});
