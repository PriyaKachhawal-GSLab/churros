'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

let listPayload = tools.requirePayload(`${__dirname}/assets/sitesLists.json`);
let sitePayload = tools.requirePayload(`${__dirname}/assets/sites.json`);
let listItemsPayload = tools.requirePayload(`${__dirname}/assets/listItems.json`);

suite.forElement('documents', 'sites', { payload: listPayload }, (test) => {

  it.skip('should support CUDS for sites', () => {
    return cloud.get(`${test.api}`)
      .then(r => cloud.post(`${test.api}`))
      .then(r => cloud.patch(`${test.api}`, sitePayload))
      .then(r => cloud.delete(`${test.api}`));
  });

  it('should support CRUDS for sites/lists', () => {
    let listId;
    const updateListPayload = {
      "__metadata": {
        "type": "SP.List"
      },
      "BaseTemplate": 100,
      "Title": "Churros-UpdateListTitle"  
    };
    return cloud.post(`${test.api}/lists`, listPayload)
      .then(r => listId = r.body.Id)
      .then(r => cloud.get(`${test.api}/lists/${listId}`))
      .then(r => cloud.get(`${test.api}/lists`))
      .then(r => cloud.patch(`${test.api}/lists/${listId}`, updateListPayload))
      .then(r => cloud.delete(`${test.api}/lists/${listId}`));
  });

  it('should support CRUDS for sites/lists/{id}/items', () => {
    let listId;
    let itemId;
    let fullName;
    const updateListItemPayload = {
      "__metadata": {
        "type": "SP.Data.April02ListItem"
      },
      "Title": "Churros-List Item"
    };
    return cloud.post(`${test.api}/lists`, listPayload)
      .then(r => listId = r.body.Id)
      .then(r => cloud.get(`${test.api}/lists/${listId}`))
      .then(r => fullName = r.body.ListItemEntityTypeFullName)
      .then(r => {
        listItemsPayload.__metadata.type = fullName;
      })
      .then(r => cloud.post(`${test.api}/lists/${listId}/items`, listItemsPayload))
      .then(r => itemId = r.body.Id)
      .then(r => cloud.get(`${test.api}/lists/${listId}/items/${itemId}`))
      .then(r => cloud.get(`${test.api}/lists/${listId}/items`))
      .then(r => {
        updateListItemPayload.__metadata.type = fullName;
      })
      .then(r => cloud.patch(`${test.api}/lists/${listId}/items/${itemId}`, updateListItemPayload))
      .then(r => cloud.delete(`${test.api}/lists/${listId}/items/${itemId}`));
  });
});