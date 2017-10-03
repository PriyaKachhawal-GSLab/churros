'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload =  {
    "name": tools.randomStr('abcdefghijklmnopqrstuvwxyz11234567890', 10),
    "body": "<p>Churros header body.</p>"
};


suite.forElement('marketing', 'email-headers', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.withOptions({ qs: { pageSize: 5 }}).should.supportPagination('id');
  test.should.supportCeqlSearchForMultipleRecords('name');
});
