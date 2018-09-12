'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const listsCreatePayload = tools.requirePayload(`${__dirname}/assets/lists-create.json`);
const listsUpdatePayload = tools.requirePayload(`${__dirname}/assets/lists-update.json`);

const options = {
  churros: {
    updatePayload: listsUpdatePayload
  }
};

suite.forElement('crm', 'lists', { payload: listsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');

  it('lastName Update Test for /hubs/crm/lists', () => {
    var accountId = null;
    return cloud.post(test.api, listsCreatePayload)
      .then(r => accountId = r.body.id)
      .then(() => cloud.patch(`${test.api}/${accountId}`, listsUpdatePayload, (r) => {
        expect(r.body.attributes.listname).to.equal(`${listsUpdatePayload.attributes.listname}`);
      }))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });
});