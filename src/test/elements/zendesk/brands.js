'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const brandsCreatePayload = tools.requirePayload(`${__dirname}/assets/brands-create.json`);
const brandsUpdatePayload = tools.requirePayload(`${__dirname}/assets/brands-update.json`);

const options = {
  churros: {
    updatePayload: brandsUpdatePayload
  }
};

suite.forElement('helpdesk', 'brands', { payload: brandsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
