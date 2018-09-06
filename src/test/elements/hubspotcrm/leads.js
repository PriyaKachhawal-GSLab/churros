'use strict';

const suite = require('core/suite');
const payload = require('./assets/leads-create.json');
const updatePayload = require('./assets/leads-update.json');

suite.forElement('crm', 'leads', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
});
