'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/projects.json`);

suite.forElement('helpdesk', 'projects', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test.withOptions({ qs: { where :`expand='lead'` }}).should.return200OnGet();
  it('should allow R for projects/{id}/avatars', () => {
    let projectid;
    return cloud.get(test.api)
      .then(r => projectid = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${projectid}/avatars`));
  });
 });
