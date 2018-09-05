'use strict';

const suite = require('core/suite');
//const tools = require('core/tools');
const payload = require('./assets/sampleBulkCustomObject_c-create');
const updatePayload = require('./assets/sampleBulkCustomObject_c-update');


suite.forElement('marketing', 'sampleBulkCustomObject_c', { payload: payload }, (test) => {
  const options = {
churros: {

updatePayload: updatePayload
}
}; 	
  test.withOptions(options).should.supportCrud();
});
