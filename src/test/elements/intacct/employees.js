'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const employeesCreatePayload = tools.requirePayload(`${__dirname}/assets/employees-create.json`);
const employeesUpdatePayload = tools.requirePayload(`${__dirname}/assets/employees-update.json`);

const options = {
  churros: {
    updatePayload: employeesUpdatePayload
  }
};

suite.forElement('finance', 'employees', { payload: employeesCreatePayload }, (test) => {
  employeesUpdatePayload.personalinfo.contactname = employeesCreatePayload.personalinfo.contact.contactname;
  test.should.supportPagination();
  test.withOptions(options).should.supportCruds();
  test.withName('should support updated > {date} Ceql search').withOptions({ qs: { where: 'whenmodified>\'08/13/2016 05:26:37\'' } }).should.return200OnGet();
});