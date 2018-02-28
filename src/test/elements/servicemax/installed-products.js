'use strict';

const suite = require('core/suite');
const payload = require('./assets/installed-products');
const tools = require('core/tools');
const cloud = require('core/cloud');
const build = (overrides) => Object.assign({}, payload, overrides);
const productsPayload = build({ Name: tools.random() });

suite.forElement('fsa', 'installed-products', { payload: productsPayload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "Name": tools.random()
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  it('should test "where" search for installed-products', () => {
      let id;
      return cloud.post(test.api, productsPayload)
        .then(r => id = r.body.id)
        .then(r => cloud.get(test.api), { qs: {  where:  `Id =\'${id}\'` } })
        .then(r => cloud.delete(`${test.api}/${id}`));
    });
});
