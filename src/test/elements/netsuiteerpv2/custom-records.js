'use strict';

const suite = require('core/suite');
const payload = require('./assets/custom-records');
//custom-record-types/{476}/custom-records
//custom-record-types/{476}/custom-records/{id}

suite.forElement('erp', 'custom-records', { payload: payload }, (test) => {
  test.withApi(`custom-record-types/476/custom-records`).should.supportCruds();
});
