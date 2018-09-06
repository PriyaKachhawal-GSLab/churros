'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/activities-create.json`);

const id = '12'; //using a static ID, as it will always have activites

suite.forElement('marketing', 'activities', { payload: payload }, (test) => {
  test.withApi('/hubs/marketing/activity-types').should.return200OnGet();
  test.withOptions({ qs: { where: `activityTypeIds in (${id}) and fromDate = '2016-12-25T11:39:58Z'` } }).should.return200OnGet();
  test.withOptions({ qs: { where: `activityTypeIds in (${id}) and fromDate = '2016-12-25T11:39:58Z'` } }).should.supportNextPagePagination(1);
  test.withOptions({ skip: true }).should.return200OnPost(payload);
});
