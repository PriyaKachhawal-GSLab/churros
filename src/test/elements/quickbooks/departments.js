'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const CreatePayload = tools.requirePayload(`${__dirname}/assets/departments-create.json`);
const UpdatePayload = tools.requirePayload(`${__dirname}/assets/departments-update.json`);

const options = {
  churros: {
    updatePayload: UpdatePayload
  }
};

suite.forElement('finance', 'departments', { payload: CreatePayload }, (test) => {
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.should.supportCeqlSearchForMultipleRecords('name');
});