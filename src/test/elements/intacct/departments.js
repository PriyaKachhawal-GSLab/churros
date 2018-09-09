'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const departmentsCreatePayload = tools.requirePayload(`${__dirname}/assets/departments-create.json`);
const departmentsUpdatePayload = tools.requirePayload(`${__dirname}/assets/departments-update.json`);

const options = {
  churros: {
    updatePayload: departmentsUpdatePayload
  }
};

suite.forElement('finance', 'departments', { payload: departmentsCreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('title');
});