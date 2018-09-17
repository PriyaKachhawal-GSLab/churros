'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;

const contactsCreatePayload = tools.requirePayload(`${__dirname}/assets/contacts-create.json`);
const contactsUpdatePayload = tools.requirePayload(`${__dirname}/assets/contacts-update.json`);

suite.forElement('marketing', 'contacts', { payload: contactsCreatePayload }, (test) => {
  const opts = {
    churros: {
      updatePayload : contactsUpdatePayload
    }
  };
  test.withOptions(opts).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
  test.withOptions({
    qs: {
      page: 1,
      pageSize: 5,
      where: "lastUpdatedAt > 1417556990"
    }
  }).should.return200OnGet();
  test.withOptions({
    qs: {
      page: 1,
      pageSize: 5,
      where: "lastUpdatedAt > '2017-01-01'"
    }
  }).should.return200OnGet();

  it('should allow GET hubs/marketing/contacts/{contactId}/activities and GET hubs/marketing/contacts/{contactId}/membership', () => {
    let contactId;
    return cloud.get(test.api)
      .then(r => contactId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${contactId}/membership`))
      .then(r => cloud.withOptions({ qs: { where: `startAt='1417556990' AND endAt='1447567663' AND type='emailOpen'` } }).get(`${test.api}/${contactId}/activities`))
      .then(r => cloud.withOptions({ qs: { where: `startAt='1417556990' AND endAt='1447567663' AND type='emailOpen'`, page: 1, pageSize: 1 } }).get(`${test.api}/${contactId}/activities`));
  });

  it(`should allow CUD for /contacts with Eloqua field names`, () => {
    let id;
    return cloud.post(test.api, contactsCreatePayload)
      .then(r => id = r.body.id)
      .then(r => cloud.patch(`${test.api}/${id}`, contactsUpdatePayload))
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(Object.keys(contactsUpdatePayload).every(key => r.body[key] === contactsUpdatePayload[key])).to.be.true;
      })
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
