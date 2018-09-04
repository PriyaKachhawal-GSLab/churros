'use strict';

const suite = require('core/suite');
const payload = require('./assets/activitiesEmails-create.json');
const updatePayload = require('./assets/activitiesEmails-update.json');

suite.forElement('crm', 'activitiesEmails', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
