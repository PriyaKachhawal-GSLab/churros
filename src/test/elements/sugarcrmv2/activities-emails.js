'use strict';

const suite = require('core/suite');
const payload = require('./assets/activities-emails-create.json');
const updatePayload = require('./assets/activities-emails-update.json');

suite.forElement('crm', 'activities-emails', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
