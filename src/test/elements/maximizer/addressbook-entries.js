'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const faker = require('faker');
const expect = require('chakram').expect;

const addressbookentryPayload = tools.requirePayload(`${__dirname}/assets/addressbookentry.json`);
const contactPayload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
const addressPayload = tools.requirePayload(`${__dirname}/assets/addresses.json`);
const opportunityPayload = tools.requirePayload(`${__dirname}/assets/opportunities.json`);

suite.forElement('crm', 'addressbook-entries', { payload: addressbookentryPayload }, (test) => {
  let parentKey;

  test.should.supportPagination("id");
  test.should.supportCruds();

  test.withApi(test.api)
      .withOptions({ qs: { where: `CompanyName='${addressbookentryPayload.CompanyName}'`, fields: `CompanyName,FullName` } })
      .withValidation(r => {
        expect(r.body.filter(obj => obj.CompanyName === addressbookentryPayload.CompanyName).length).to.equal(r.body.length);
        expect(Object.keys(r.body[0]).length).to.equal(2);
      })
      .withName('should allow GET with options /addressbook-entries')
      .should.return200OnGet();

  before(() =>
    cloud.post(`${test.api}`, addressbookentryPayload)
    .then(r => {
      parentKey = r.body.id;
      contactPayload.ParentKey = r.body.id;
      addressPayload.ParentKey = r.body.id;
      opportunityPayload.AbEntryKey = r.body.id;
    })
  );

  after(() => cloud.delete(`${test.api}/${parentKey}`));

  it('should allow CRUDS for /contacts', () => {
    let contactId;
    return cloud.post(`/hubs/crm/contacts`, contactPayload)
      .then(r => contactId = r.body.Key)
      .then(() => cloud.withOptions({ qs: { where: `LastName='${contactPayload.LastName}'` } }).get(`/hubs/crm/contacts`))
      .then(r => expect(r.body[0].LastName).to.equal(contactPayload.LastName))
      .then(() => cloud.withOptions({ qs: { fields:`CompanyName,FullName,LastName,Address` } }).get(`/hubs/crm/contacts`))
      .then(r => expect(Object.keys(r.body[0]).length).to.equal(4))
      .then(() => cloud.get(`/hubs/crm/contacts/${contactId}`))
      .then(r => expect(r.body.LastName).to.equal(contactPayload.LastName))
      .then(() => cloud.withOptions({ qs: { fields:`CompanyName,FullName,LastName,Address` } }).get(`/hubs/crm/contacts/${contactId}`))
      .then(r => expect(Object.keys(r.body).length).to.equal(4))
      .then(() => contactPayload.LastName = faker.name.lastName())
      .then(() => cloud.patch(`/hubs/crm/contacts/${contactId}`, contactPayload))
      .then(() => cloud.delete(`/hubs/crm/contacts/${contactId}`))
      .catch(e => { if (response) {return cloud.delete(`${test.api}/${response.id}`)
      .catch(() => {})
      .then(() => { throw new Error(e); });} else { throw new Error(e);}});
  });

  it('should allow CUDS for /addresses', () => {
    let addressId;
    return cloud.post(`/hubs/crm/addresses`, addressPayload)
      .then(r => addressId = r.body.Key)
      .then(() => cloud.get(`/hubs/crm/addresses`))
      .then(r => expect(r.body[0]).to.contain.key('City'))
      .then(() => cloud.withOptions({ qs: { fields:`City,Country,ZipCode` } }).get(`/hubs/crm/addresses`))
      .then(r => expect(Object.keys(r.body[0]).length).to.equal(3))
      .then(() => addressPayload.City = faker.address.city())
      .then(() => cloud.patch(`/hubs/crm/addresses/${addressId}`, addressPayload))
      .then(() => cloud.delete(`/hubs/crm/addresses/${addressId}`))
      .catch(e => { if (response) {return cloud.delete(`${test.api}/${response.id}`)
      .catch(() => {})
      .then(() => { throw new Error(e); });} else { throw new Error(e);}});

  });

  it('should allow CRUDS for /opportunities', () => {
    let opportunityId;
    return cloud.post(`/hubs/crm/opportunities`, opportunityPayload)
      .then(r => opportunityId = r.body.Key)
      .then(r => cloud.withOptions({ qs: { where: `Description='${opportunityPayload.Description}'` } }).get(`/hubs/crm/opportunities`))
      .then(r => expect(r.body[0].Description).to.equal(opportunityPayload.Description))
      .then(() => cloud.withOptions({ qs: { fields:`Leader, Objective` } }).get(`/hubs/crm/opportunities`))
      .then(r => expect(Object.keys(r.body[0]).length).to.equal(2))
      .then(() => cloud.get(`/hubs/crm/opportunities/${opportunityId}`))
      .then(r => expect(r.body.Description).to.equal(opportunityPayload.Description))
      .then(() => cloud.withOptions({ qs: { fields:`Leader, Objective` } }).get(`/hubs/crm/opportunities/${opportunityId}`))
      .then(r => expect(Object.keys(r.body).length).to.equal(2))
      .then(() => opportunityPayload.Description = faker.random.word())
      .then(() => cloud.patch(`/hubs/crm/opportunities/${opportunityId}`, opportunityPayload))
      .then(() => cloud.delete(`/hubs/crm/opportunities/${opportunityId}`))
      .catch(e => { if (response) {return cloud.delete(`${test.api}/${response.id}`)
      .catch(() => {})
      .then(() => { throw new Error(e); });} else { throw new Error(e);}});

  });

});
