'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const locationsCreatePayload = tools.requirePayload(`${__dirname}/assets/locations-create.json`);
const locationsUpdatePayload = tools.requirePayload(`${__dirname}/assets/locations-update.json`);

const options = {
  churros: {
    updatePayload: locationsUpdatePayload
  }
};

suite.forElement('finance', 'locations', { payload: locationsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('name');
});
