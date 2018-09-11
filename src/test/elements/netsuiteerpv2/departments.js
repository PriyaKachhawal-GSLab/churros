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

suite.forElement('erp', 'departments', { payload : departmentsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('name');
});