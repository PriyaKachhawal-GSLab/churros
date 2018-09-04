'use strict';

const suite = require('core/suite');
const payload = require('./assets/activitiesCalls-create.json');
const updatePayload = require('./assets/activitiesCalls-update.json');

suite.forElement('crm', 'activitiesCalls', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
