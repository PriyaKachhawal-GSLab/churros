'use strict';

const suite = require('core/suite');
const payload = require('./assets/tasks-create.json');
const updatePayload = require('./assets/tasks-update.json');

suite.forElement('crm', 'tasks', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.should.supportCruds();
  test.should.supportPagination();
});
