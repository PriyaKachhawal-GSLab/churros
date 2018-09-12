'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const opportunitiesCreatePayload = tools.requirePayload(`${__dirname}/assets/opportunities-create.json`);
const opportunitiesUpdatePayload = tools.requirePayload(`${__dirname}/assets/opportunities-update.json`);

const options = {
  churros: {
    updatePayload: opportunitiesUpdatePayload
  }
};

suite.forElement('crm', 'opportunities', { payload: opportunitiesCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');

  it('int_forecast And proposedsolution Update Test for /hubs/crm/opportunities', () => {
    var accountId = null;
    return cloud.post(test.api, opportunitiesCreatePayload)
      .then(r => accountId = r.body.id)
      .then(() => cloud.patch(`${test.api}/${accountId}`, opportunitiesUpdatePayload, (r) => {
        expect(r.body.attributes.int_forecast).to.equal(opportunitiesUpdatePayload.attributes.int_forecast);
        expect(r.body.attributes.proposedsolution).to.equal(undefined);
      }))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });
});