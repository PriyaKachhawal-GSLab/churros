'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/opportunities.json`);
const cloud = require('core/cloud');

suite.forElement('crm', 'opportunities', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "title": tools.random(),
        "value": tools.randomInt()
      }
    }
  };
  test.withOptions(options).should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.withOptions({ qs: { where: 'id = \'2171\'' } }).should.return200OnGet();

  const updatePayloadActivites = {
    "subject": tools.random()
  };
  const activitiesPayload = {
    "subject": tools.random(),
    "type": "call",
    "due_date": "2015-04-24",
    "due_time": "12:30"
  };
  it('should support CRUDS for opportunities/activities', () => {
    let opportunitiesId, activitiesId;
    return cloud.post(test.api, payload)
      .then(r => opportunitiesId = r.body.id)
      .then(r => cloud.get(`${test.api}/${opportunitiesId}/activities`))
      .then(r => cloud.post(`${test.api}/${opportunitiesId}/activities`, activitiesPayload))
      .then(r => activitiesId = r.body.id)
      .then(r => cloud.get(`${test.api}/${opportunitiesId}/activities/${activitiesId}`))
      .then(r => cloud.put(`${test.api}/${opportunitiesId}/activities/${activitiesId}`, updatePayloadActivites))
      .then(r => cloud.delete(`${test.api}/${opportunitiesId}/activities/${activitiesId}`));
  });

  const updatePayloadNotes = {
    "content": "<h2>" + tools.randomStr() + "<h1>"
  };
  const notesPayload = {
    "content": "<h1> Helllo <h1>"
  };
  it('should support CRUDS for opportunities/notes', () => {
    let opportunitiesId, notesId;
    return cloud.post(`${test.api}`, payload)
      .then(r => opportunitiesId = r.body.id)
      .then(r => cloud.get(`${test.api}/${opportunitiesId}/notes`))
      .then(r => cloud.post(`${test.api}/${opportunitiesId}/notes`, notesPayload))
      .then(r => notesId = r.body.id)
      .then(r => cloud.get(`${test.api}/${opportunitiesId}/notes/${notesId}`))
      .then(r => cloud.put(`${test.api}/${opportunitiesId}/notes/${notesId}`, updatePayloadNotes))
      .then(r => cloud.delete(`${test.api}/${opportunitiesId}/notes/${notesId}`))
      .then(r => cloud.delete(`${test.api}/${opportunitiesId}`));
  });

  it('should GET /accounts mails', () => {
    let opportunityId;
    return cloud.post(test.api, payload)
      .then(r => opportunityId = r.body.id)
      .then(r => cloud.get(`${test.api}/${opportunityId}/mails`))
      .then(r => cloud.delete(`${test.api}/${opportunityId}`));

  });
});
