'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const tasksCreatePayload = tools.requirePayload(`${__dirname}/assets/tasks-create.json`);
const tasksUpdatePayload = tools.requirePayload(`${__dirname}/assets/tasks-update.json`);

const options = {
  churros: {
    updatePayload: tasksUpdatePayload
  }
};

suite.forElement('crm', 'tasks', { payload : tasksCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});