'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

let employeesCreatePayload = tools.requirePayload(`${__dirname}/assets/employees-create.json`);
let employeesUpdatePayload = tools.requirePayload(`${__dirname}/assets/employees-update.json`);

const options = {
    churros: {
      updatePayload: employeesUpdatePayload
    }
  };

suite.forElement('humancapital', 'employees', {payload : employeesCreatePayload}, (test) => {
    test.should.supportNextPagePagination(1);
    test.withOptions(options).should.supportCruds();
    test.should.supportCeqlSearchForMultipleRecords('city');
});