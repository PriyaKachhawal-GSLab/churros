'use strict';

//dependencies at the top
const expect = require('chakram').expect;
const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
//how to import payloads
const payload = tools.requirePayload(`${__dirname}/assets/accounts.json`);
const activities = tools.requirePayload(`${__dirname}/assets/activities.json`);
const notes = tools.requirePayload(`${__dirname}/assets/notes.json`);
const tasks = tools.requirePayload(`${__dirname}/assets/tasks.json`);

suite.forElement('crm', 'accounts', { payload: payload }, (test) => {
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');//Search by 'id'
  test.should.supportCruds();
  test.should.return404OnGet('0');//should not be able to find of 0

  //'it' statements to test sfdc specific issues
  it('should allow CRUDS for /hubs/crm/accounts/:id/activites', () => {
    let accountId;
    return cloud.post(test.api, payload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.cruds(`${test.api}/${accountId}/activities`, activities))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });

  //should validate paginating with nextPage and pageSize for /hubs/crm/accounts/:id/activities
  test.should.supportPaginationForNested('activities', () => tools.requirePayload(`${__dirname}/assets/activities.json`));

  it('should allow CRUDS for /hubs/crm/accounts/:id/notes', () => {
    let accountId;
    return cloud.post(test.api, payload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.cruds(`${test.api}/${accountId}/notes`, notes))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });

  //should validate paginating with nextPage and pageSize for /hubs/crm/accounts/:id/notes
  test.should.supportPaginationForNested('notes', () => tools.requirePayload(`${__dirname}/assets/notes.json`));

  it('should allow CRUDS for /hubs/crm/accounts/:id/tasks', () => {
    let accountId;
    return cloud.post(test.api, payload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.cruds(`${test.api}/${accountId}/tasks`, tasks))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });

  //should validate paginating with nextPage and pageSize for /hubs/crm/accounts/:id/tasks
  test.should.supportPaginationForNested('tasks', () => tools.requirePayload(`${__dirname}/assets/tasks.json`));

  it('should find account with quote in name', () => {
    let accountId;
    let accountPayload = {
      "name": "Churro's Test Account",
      "type": "Prospect",
      "phone": "555-666-7777",
      "website": "http://www.superawesome.com"
    };
    let query = { where: "Name='Churro''s Test Account'" };

    return cloud.post(test.api, accountPayload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.withOptions({ qs: query }).get(test.api))
      .then(r => expect(r).to.have.statusCode(200) && expect(r.body).to.not.be.null &&
        expect(r.body).to.be.a('array') && expect(r.body).to.have.length.above(0) &&
        expect(r.body[0]).to.contain.key('Name') &&
        expect(r.body[0].Name).to.equal("Churro's Test Account"))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });
});
