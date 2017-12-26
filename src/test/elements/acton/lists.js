'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/lists.json`);
const contactPayload = tools.requirePayload(`${__dirname}/assets/contacts.json`);
const contactUpdatePayload = tools.requirePayload(`${__dirname}/assets/contactsUpdate.json`);
const fs = require('fs');
const cloud = require('core/cloud');

suite.forElement('marketing', 'lists', { payload: payload }, (test) => {

  it('it should support Create lists without CSV file', () => {
    let opts;
    let listId;
    let listCreate = tools.requirePayload(`${__dirname}/assets/listCreate.json`);
    opts = { formData: { list: JSON.stringify(listCreate) } };
    return cloud.withOptions(opts).post(test.api, undefined)
      .then(r => {
        listId = r.body.id;
        cloud.delete(`${test.api}/${listId}`);
      });
  });

  it('it should support Create lists with CSV file', () => {
    let opts;
    let listId;
    let listCreate = tools.requirePayload(`${__dirname}/assets/listCreate.json`);
    let documentPath = __dirname + '/assets/createList.csv';
    opts = { formData: { list: JSON.stringify(listCreate), file: fs.createReadStream(documentPath) } };
    return cloud.withOptions(opts).post(test.api, undefined)
      .then(r => {
        listId = r.body.listId;
        cloud.delete(`${test.api}/${listId}`);
      });
  });

  it('it should support CRUD lists', () => {
    let listId;
    let opts;
    let documentPath = __dirname + '/assets/updateList.csv';
    let listUpdate = tools.requirePayload(`${__dirname}/assets/listUpdate.json`);
    opts = { formData: { list: JSON.stringify(payload) } };
    return cloud.withOptions(opts).post(test.api, undefined)
      .then(r => {
        listId = r.body.id;
        listUpdate.mergespecs[0].dstListId = listId;
        opts = { formData: { list: JSON.stringify(listUpdate), file: fs.createReadStream(documentPath) } };
      })
      .then(r => cloud.get('/hubs/marketing/lists'))
      .then(r => cloud.get(`${test.api}/${listId}`))
      .then(r => cloud.withOptions(opts).patch(`${test.api}/${listId}`, undefined))
      .then(r => cloud.delete(`${test.api}/${listId}`));
  });

  it('it should support GET all contacts inside a list', () => {
    return cloud.get('/hubs/marketing/lists')
      .then(r => r.body.filter(r => r.id))
      .then(filteredLists => cloud.get(`/hubs/marketing/lists/${filteredLists[0].id}/contacts`));
  });

  it('it should support POST a contact inside a list', () => {
    return cloud.get('/hubs/marketing/lists')
      .then(r => r.body.filter(r => r.id))
      .then(filteredLists => cloud.post(`/hubs/marketing/lists/${filteredLists[0].id}/contacts`, contactPayload));
  });

   it('should sleep for 60 seconds to avoid rate limits', () => {
    return tools.sleep(60);
  });
  
  it('it should support GET a contact inside a list', () => {
    let filteredLists;

    return cloud.get('/hubs/marketing/lists')
      .then(r => r.body.filter(r => r.id))
      .then(fi => filteredLists = fi)
      .then(() => cloud.post(`/hubs/marketing/lists/${filteredLists[0].id}/contacts`, contactPayload))
      .then(contacts => cloud.get(`/hubs/marketing/lists/${filteredLists[0].id}/contacts/${contacts.body[0].id}`));
  });

  it('it should support PATCH a contact inside a list', () => {
    let filteredLists;

    return cloud.get('/hubs/marketing/lists')
      .then(r => r.body.filter(r => r.id))
      .then(fi => filteredLists = fi)
      .then(() => cloud.post(`/hubs/marketing/lists/${filteredLists[0].id}/contacts`, contactPayload))
      .then(contacts => cloud.patch(`/hubs/marketing/lists/${filteredLists[0].id}/contacts/${contacts.body[0].id}`, contactUpdatePayload));
  });

  it('should sleep for 60 seconds to avoid rate limits', () => {
    return tools.sleep(60);
  });

  it('it should support DELETE a contact inside a list', () => {
    let filteredLists;

    return cloud.get('/hubs/marketing/lists')
      .then(r => r.body.filter(r => r.id))
      .then(fi => filteredLists = fi)
      .then(() => cloud.post(`/hubs/marketing/lists/${filteredLists[0].id}/contacts`, contactPayload))
      .then(contacts => cloud.delete(`/hubs/marketing/lists/${filteredLists[0].id}/contacts/${contacts.body[0].id}`));
  });

});
