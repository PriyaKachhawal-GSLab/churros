'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/sampleBulkCustomObject_c.json`);

suite.forElement('marketing', 'sampleBulkCustomObject_c', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "myAddress": "Paris Belle Epoque, Trou Aux Cerf",
        "myCity": "Curepipe",
        "myName": "Zeeshan Gungabasen"
      }
    }
  };
  test.withOptions(options).should.supportCrud();
});
