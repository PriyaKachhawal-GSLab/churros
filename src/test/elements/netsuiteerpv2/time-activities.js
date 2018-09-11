'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const timeActivitiesCreatePayload = tools.requirePayload(`${__dirname}/assets/time-activities-create.json`);
const timeActivitiesUpdatePayload = tools.requirePayload(`${__dirname}/assets/time-activities-update.json`);

const options = {
  churros: {
    updatePayload: timeActivitiesUpdatePayload
  }
};

suite.forElement('erp', 'time-activities', { payload: timeActivitiesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});