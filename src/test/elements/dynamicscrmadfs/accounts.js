'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const accountsCreatePayload = tools.requirePayload(`${__dirname}/assets/accounts-create.json`);
const accountsUpdatePayload = tools.requirePayload(`${__dirname}/assets/accounts-update.json`);

const options = {
  churros: {
    updatePayload: accountsUpdatePayload
  }
};

suite.forElement('crm', 'accounts', { payload: accountsCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');

  it('Float And Null Update Test for /hubs/crm/accounts', () => {
    var accountId = null;
    return cloud.post(test.api, accountsCreatePayload)
      .then(r => accountId = r.body.id)
      .then(() => cloud.patch(`${test.api}/${accountId}`, accountsUpdatePayload, (r) => {
        expect(r.body.attributes.address1_latitude).to.equal(4.4);
        expect(r.body.attributes.address1_city).to.equal(undefined);
      }))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });
});