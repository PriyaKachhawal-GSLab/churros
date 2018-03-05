'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const customRecordsPayload = require('./assets/customrecords');


suite.forElement('erp', 'custom-record-types', (test) => {
    test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination();
    it('should allow CRUDS /hubs/erp/customrecords', () => {
      let customRecordTypeId = 478;
      let customRecordId;
      return cloud.post(`${test.api}/${customRecordTypeId}/custom-records`, customRecordsPayload)
      .then(r => customRecordId = r.body.id)
      .then(r => cloud.get(`${test.api}/${customRecordTypeId}/custom-records`))
      .then(r => cloud.get(`${test.api}/${customRecordTypeId}/custom-records/${customRecordId}`))
      .then(r => cloud.patch(`${test.api}/${customRecordTypeId}/custom-records/${customRecordId}`,customRecordsPayload))
      .then(r => cloud.delete(`${test.api}/${customRecordTypeId}/custom-records/${customRecordId}`));

    });
});
