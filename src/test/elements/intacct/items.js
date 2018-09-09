'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const itemsCreatePayload = tools.requirePayload(`${__dirname}/assets/items-create.json`);
const itemsUpdatePayload = tools.requirePayload(`${__dirname}/assets/items-update.json`);

const options = {
  churros: {
    updatePayload: itemsUpdatePayload
  }
};

suite.forElement('finance', 'items', { payload: itemsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('itemname');
});
