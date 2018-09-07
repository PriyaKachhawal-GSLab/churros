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
const notePayload = tools.requirePayload(`${__dirname}/assets/notes.json`);
const documentPayload = tools.requirePayload(`${__dirname}/assets/documents.json`);


suite.forElement('crm', 'addressbook-entries', { payload: addressbookentryPayload }, (test) => {
  let parentKey;

  test.should.supportPagination("id");
  test.should.supportCruds();

  test.withApi(test.api)
      .withName(`should support nested search i.e.,  filter by where='Address.Country'`)
      .withOptions({ qs: { where: `Address.Country='${addressbookentryPayload.Address.Country}'` } })
      .withValidation(r => {
        expect(r.body.filter(obj => obj.Address.Country === `${addressbookentryPayload.Address.Country}`));
      })
      .should.return200OnGet();

      test.withApi(test.api)
      .withName(`should support nested search i.e.,  filter by where with multiple options using and`)
      .withOptions({ qs: { where: `Address.Country='${addressbookentryPayload.Address.Country}' and CompanyName='${addressbookentryPayload.CompanyName}'` } })
      .withValidation(r => {
        expect(r.body.filter(obj => obj.Address.Country === `${addressbookentryPayload.Address.Country}`));
        expect(r.body.filter(obj => obj.CompanyName === `${addressbookentryPayload.CompanyName}`));
      })
      .should.return200OnGet();

      test.withApi(test.api)
      .withName(`should support nested search i.e.,  filter by where with multiple options using or`)
      .withOptions({ qs: { where: `Address.Country='${addressbookentryPayload.Address.Country}' or CompanyName='${addressbookentryPayload.CompanyName}'` } })
      .withValidation(r => {
        expect(r.body.filter(obj => obj.Address.Country === `${addressbookentryPayload.Address.Country}`));
        expect(r.body.filter(obj => obj.CompanyName === `${addressbookentryPayload.CompanyName}`));
        
      })
      .should.return200OnGet();

      test.withApi(test.api)
      .withName(`should support nested search with IN operator`)
      .withOptions({ qs: { where: `Address.Country in ('India', 'USA') ` } })
      .withValidation(r => {
        expect(r.body.filter(obj => obj.Address.Country === `India`));
        //expect(r.body.filter(obj => obj.CompanyName === `${addressbookentryPayload.CompanyName}`));
        
      })
      .should.return200OnGet();

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
      notePayload.Parent = r.body.id;
      documentPayload.Parent = r.body.id;
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
      .catch(e => {
        if (contactId) cloud.delete(`/hubs/crm/contacts/${contactId}`);
        throw new Error(e);
      });
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
      .catch(e => {
        if (addressId) cloud.delete(`/hubs/crm/addresses/${addressId}`);
        throw new Error(e);
      });
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
      .catch(e => {
        if (opportunityId) cloud.delete(`/hubs/crm/opportunities/${opportunityId}`);
        throw new Error(e);
      });
  });

  it('should allow CRUDS for /notes', () => {
    let noteId;
    return cloud.post(`/hubs/crm/notes`, notePayload)
      .then(r => noteId = r.body.Key)
      .then(() => cloud.withOptions({ qs: { where: `Type='${notePayload.Type}'` } }).get(`/hubs/crm/notes`))
      .then(r => expect(r.body[0].Type).to.equal(notePayload.Type))
      .then(() => cloud.withOptions({ qs: { fields:`Key,Text,SecStatus,Type` } }).get(`/hubs/crm/notes`))
      .then(r => expect(Object.keys(r.body[0]).length).to.equal(4))
      .then(() => cloud.get(`/hubs/crm/notes/${noteId}`))
      .then(r => expect(r.body.Type).to.equal(notePayload.Type))
      .then(() => cloud.withOptions({ qs: { fields:`Key,Text,SecStatus,Type` } }).get(`/hubs/crm/notes/${noteId}`))
      .then(r => expect(Object.keys(r.body).length).to.equal(4))
      .then(() => notePayload.Text = faker.name.title())
      .then(() => cloud.patch(`/hubs/crm/notes/${noteId}`, notePayload))
      .then(() => cloud.delete(`/hubs/crm/notes/${noteId}`))
      .catch(e => {
        if (noteId) cloud.delete(`/hubs/crm/notes/${noteId}`);
        throw new Error(e);
      });
  });

  it('should allow CRUDS for /documents', () => {
    let documentId;
    return cloud.post(`/hubs/crm/documents`, documentPayload)
      .then(r => documentId = r.body.Key)
      .then(() => cloud.withOptions({ qs: { where: `Name like '${documentPayload.Name}'` } }).get(`/hubs/crm/documents`))
      .then(r => expect(r.body[0].Name).to.equal(documentPayload.Name))
      .then(() => cloud.withOptions({ qs: { fields:`Name,Type,Description,Key` } }).get(`/hubs/crm/documents`))
      .then(r => expect(Object.keys(r.body[0]).length).to.equal(4))
      .then(() => cloud.get(`/hubs/crm/documents/${documentId}`))
      .then(r => expect(r.body.Name).to.equal(documentPayload.Name))
      .then(() => cloud.withOptions({ qs: { fields:`Name,Type,Description,Key` } }).get(`/hubs/crm/documents/${documentId}`))
      .then(r => expect(Object.keys(r.body).length).to.equal(4))
      .then(() => documentPayload.Name = faker.name.title())
      .then(() => cloud.patch(`/hubs/crm/documents/${documentId}`, documentPayload))
      .then(() => cloud.delete(`/hubs/crm/documents/${documentId}`))
      .catch(e => {
        if (documentId) cloud.delete(`/hubs/crm/documents/${documentId}`);
        throw new Error(e);
      });
  });

});
