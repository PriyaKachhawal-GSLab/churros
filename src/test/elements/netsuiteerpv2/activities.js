'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const activitiesCreatePayload = tools.requirePayload(`${__dirname}/assets/activities-create.json`);
const activitiesUpdatePayload = tools.requirePayload(`${__dirname}/assets/activities-update.json`);

const options = {
  churros: {
    updatePayload: activitiesUpdatePayload
  }
};

suite.forElement('erp', 'activities', { payload : activitiesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');
});