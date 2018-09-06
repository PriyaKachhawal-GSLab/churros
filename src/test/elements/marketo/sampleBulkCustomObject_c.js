'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/sampleBulkCustomObject_c-create`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/sampleBulkCustomObject_c-update`);

suite.forElement('marketing', 'sampleBulkCustomObject_c', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: updatePayload
    }
  };
  test.withOptions(options).should.supportCrud();
});
