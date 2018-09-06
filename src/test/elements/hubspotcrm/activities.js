'use strict';

const suite = require('core/suite');
const payload = require('./assets/activities-create.json');
const updatePayload = require('./assets/activities-update.json');

suite.forElement('crm', 'activities', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCrud();
});
