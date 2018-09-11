'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const casesCreatePayload = tools.requirePayload(`${__dirname}/assets/cases-create.json`);
const casesUpdatePayload = tools.requirePayload(`${__dirname}/assets/cases-update.json`);

const options = {
  churros: {
    updatePayload: casesUpdatePayload
  }
};

suite.forElement('erp', 'cases', { payload: casesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');

  it('should allow GET /hubs/erp/cases/:id/messages ', () => {
    let caseId, messageId;
    return cloud.get(test.api)
      .then(r => caseId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${caseId}/messages`))
      .then(r => messageId = r.body[0].internalId)
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 5 } }).get(`${test.api}/${caseId}/messages`))
      .then(r => cloud.withOptions({ qs: { where: `internalId ='${messageId}'` } }).get(`${test.api}/${caseId}/messages`));
  });
});


