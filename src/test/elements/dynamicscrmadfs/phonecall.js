'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const phonecallCreatePayload = tools.requirePayload(`${__dirname}/assets/phonecall-create.json`);
const phonecallUpdatePayload = tools.requirePayload(`${__dirname}/assets/phonecall-update.json`);

const options = {
  churros: {
    updatePayload: phonecallUpdatePayload
  }
};

suite.forElement('crm', 'phonecall', { payload: phonecallCreatePayload }, (test) => {
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { page: 1, pageSize: 5 } }).should.supportPagination('id');
  test.should.supportCeqlSearch('id');

  it('description Update Test for /hubs/crm/phonecall', () => {
    var accountId = null;
    return cloud.post(test.api, phonecallCreatePayload)
      .then(r => accountId = r.body.id)
      .then(() => cloud.patch(`${test.api}/${accountId}`, phonecallUpdatePayload, (r) => {
        expect(r.body.attributes.description).to.equal(phonecallUpdatePayload.attributes.description);
      }))
      .then(r => cloud.delete(`${test.api}/${accountId}`));
  });
});