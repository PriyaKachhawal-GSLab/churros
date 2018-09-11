'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const customRecordsCreatePayload = tools.requirePayload(`${__dirname}/assets/customrecords-create.json`);
const customRecordsUpdatePayload = tools.requirePayload(`${__dirname}/assets/customrecords-update.json`);

const options = {
  churros: {
    updatePayload: customRecordsUpdatePayload
  }
};

suite.forElement('erp', 'custom-record-types', { payload : customRecordsCreatePayload }, (test) => {
  let customRecordTypeId = 478;
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.return200OnGet();
  it(`should allow CRUDS for ${test.api}/${customRecordTypeId}/custom-records`, () => {
    return cloud.withOptions(options).cruds(`${test.api}/${customRecordTypeId}/custom-records`, customRecordsCreatePayload);
  });
});
