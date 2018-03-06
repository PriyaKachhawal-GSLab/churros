'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/incidents.json`);
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;

var date = new Date();
date.setFullYear(date.getFullYear() + tools.randomInt());
payload.due_by = date.toISOString();
payload.fr_due_by = date.toISOString();
var types = ["Question", "Incident", "Problem", "Feature Request", "Lead"];
payload.type = types[Math.floor(Math.random() * types.length)];

suite.forElement('helpdesk', 'incidents', { payload: payload }, (test) => {
  test.should.supportCruds();
  test.should.supportPagination();
  test
    .withName(`should support searching ${test.api} by updated_since`)
    .withOptions({ qs: { where: 'updated_since=\'2016-01-01\'' } })
    .withValidation((r) => expect(r.body).to.not.be.empty)
    .should.return200OnGet();
  it('should support GET /hubs/helpdesk/incidents/:id/comments ', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(`${test.api}/${id}/comments`))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
