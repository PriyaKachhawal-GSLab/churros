'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/accounts-update.json`);
const paginationPayload = tools.requirePayload(`${__dirname}/assets/accountsActivities-queryType.json`);
const searchTest = tools.requirePayload(`${__dirname}/assets/accounts-searchTest.json`);
const cloud = require('core/cloud');
const moment = require('moment');

var accountsId = 285826161;

suite.forElement('crm', 'accounts', { payload: payload }, (test) => {
  test.should.supportPagination();

  it('should test CRUD for /accounts and GET /accounts/{id}/activities', () => {
    let accountId;
    const options = { qs: paginationPayload };
    return cloud.post(test.api, payload)
      .then(r => accountId = r.body.id)
      .then(r => cloud.get(`${test.api}/${accountId}`))
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.get(`${test.api}/${accountId}/activities`))
      .then(r => cloud.withOptions(options).get(`${test.api}/${accountId}/activities`))
      .then(r => options.qs.nextPage = r.response.headers['elements-next-page-token'])
      .then(r => cloud.withOptions(options).get(`${test.api}/${accountId}/activities`))
      .then(r => cloud.patch(`${test.api}/${accountId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });

  it('should test accounts poller url', () => {
    let id;
    let objects;
    const options = { qs: searchTest  };
    const checkLength = (objects) => {
      return (objects.length > 0);
    };
    const checkId = (postedId, polledId) => {
      return (postedId === polledId);
    };
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id )
      .then(r => tools.sleep(10))
      .then(r => searchTest.where = "lastmodifieddate=\'" + moment().subtract(10, 'seconds').format() + "\'")
      .then(r => cloud.withOptions(options).get(test.api))
      .then(r => objects = r.body)
      .then(r => checkLength(objects))
      .then(r => expect(r).to.be.true)
      .then(r => checkId(id, objects[0].id))
      .then(r => expect(r).to.be.true)
      .then(r => expect(objects[0].properties).to.contain.key('hs_lastmodifieddate') && expect(objects[0].properties).to.contain.key('createdate'))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});

// We are skipping this as there are no activities in our account.
suite.forElement('crm', `accounts/${accountsId}/activities`, { payload: payload,skip : true }, (test) => {
  test.should.supportNextPagePagination(1);
});
