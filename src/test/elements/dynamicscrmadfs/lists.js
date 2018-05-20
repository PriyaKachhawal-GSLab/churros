'use strict';

const suite = require('core/suite');
const payload = require('./assets/lists');
const tools = require('core/tools');
const build = (overrides) => Object.assign({}, payload, overrides);
const listPayload = build({ listname: tools.random() });
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = chakram.expect;


suite.forElement('crm', 'lists', { payload: listPayload }, (test) => {
  var listUpdate = {
    attributes : {
      "listname": "List Churros Updated"
    }
  };
  it('Update Test for /hubs/crm/lists', () => {
      var listId = null;
      return cloud.post(test.api, listPayload)
        .then(r => listId = r.body.id)
        .then(() => cloud.patch(`${test.api}/${listId}`, listUpdate,(r) => {
          expect(r.body.attributes.listname).to.equal("List Churros Updated");
          })
        )
        .then(r => cloud.delete(`${test.api}/${listId}`));
      });
  test.should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('id');
});
