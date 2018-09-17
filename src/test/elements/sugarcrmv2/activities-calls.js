'use strict';

const suite = require('core/suite');
const payload = require('./assets/activities-calls-create.json');
const updatePayload = require('./assets/activities-calls-update.json');

suite.forElement('crm', 'activities-calls', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  // update timesout alot
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
