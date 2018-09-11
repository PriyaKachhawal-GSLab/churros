'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const subsidiariesCreatePayload = tools.requirePayload(`${__dirname}/assets/subsidiaries-create.json`);
const subsidiariesUpdatePayload = tools.requirePayload(`${__dirname}/assets/subsidiaries-update.json`);

const options = {
  churros: {
    updatePayload: subsidiariesUpdatePayload
  }
};

//Adding a Subsidiary would exceed the number of licenses you have purchased. Please contact NetSuite for additional licenses.,
suite.forElement('erp', 'subsidiaries', { payload : subsidiariesCreatePayload, skip : true }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
});