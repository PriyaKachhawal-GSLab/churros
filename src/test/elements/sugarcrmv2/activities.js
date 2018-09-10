'use strict';

const suite = require('core/suite');
const payload = require('./assets/activities-create.json');
const updatePayload = require('./assets/activities-update.json');
const chakram = require('chakram');

suite.forElement('crm', 'activities', { payload: payload }, (test) => {
  const opts = {
    qs: { type: 'calls' },
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(opts).should.supportCruds(chakram.put);
  test.withOptions(opts).should.supportPagination();
});
