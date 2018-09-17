'use strict';

const suite = require('core/suite');
const payload = require('./assets/activities-events-create.json');
const updatePayload = require('./assets/activities-events-update.json');


suite.forElement('crm', 'activities-events', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
