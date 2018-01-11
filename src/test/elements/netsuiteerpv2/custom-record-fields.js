'use strict';

const suite = require('core/suite');
//custom-record-types/{476}/custom-records
//custom-record-types/{476}/custom-records/{id}

suite.forElement('erp', 'custom-record-fields', (test) => {
  test.withApi(`custom-record-types/476/custom-record-fields`).should.supportPagination();
});
