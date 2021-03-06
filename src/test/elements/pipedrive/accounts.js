'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/accounts.json`);

suite.forElement('crm', 'accounts', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "name": tools.random()
      }
    }
  };
  test.withOptions(options).should.supportCruds(chakram.put);
  test.should.supportPagination();
  test.withOptions({ qs: { where: 'name = \'newTestName3\'' } }).should.return200OnGet();

  const updatePayloadActivites = {
    "subject": tools.random()
  };
  const activitiesPayload = {
    "subject": tools.random(),
    "type": "call",
    "due_date": "2015-04-24",
    "due_time": "12:30"
  };
  it('should support CRUDS for accounts/activities', () => {
    let accountId, activitiesId;
    return cloud.post(test.api, payload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.get(`${test.api}/${accountId}/activities`))
      .then(r => cloud.post(`${test.api}/${accountId}/activities`, activitiesPayload))
      .then(r => activitiesId = r.body.id)
      .then(r => cloud.get(`${test.api}/${accountId}/activities/${activitiesId}`))
      .then(r => cloud.put(`${test.api}/${accountId}/activities/${activitiesId}`, updatePayloadActivites))
      .then(r => cloud.delete(`${test.api}/${accountId}/activities/${activitiesId}`));
  });

  const updatePayloadNotes = {
    "content": "<h2>" + tools.randomStr() + "<h1>"
  };
  const notesPayload = {
    "content": "<h1> Helllo <h1>"
  };
  it('should support CRUDS for accounts/notes', () => {
    let accountId, notesId;
    return cloud.post(`${test.api}`, payload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.get(`${test.api}/${accountId}/notes`))
      .then(r => cloud.post(`${test.api}/${accountId}/notes`, notesPayload))
      .then(r => notesId = r.body.id)
      .then(r => cloud.get(`${test.api}/${accountId}/notes/${notesId}`))
      .then(r => cloud.put(`${test.api}/${accountId}/notes/${notesId}`, updatePayloadNotes))
      .then(r => cloud.delete(`${test.api}/${accountId}/notes/${notesId}`))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });

  it('should GET /accounts  mails', () => {
    let accountId;
    return  cloud.post(test.api, payload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.get(`${test.api}/${accountId}/mails`))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });
});
