'use strict';

const suite = require('core/suite');
const payload = require('./assets/order-parts');
const cloud = require('core/cloud');
const build = (overrides) => Object.assign({}, payload, overrides);
const productsPayload = build({ SVMXC__On_Hold__c: true });

suite.forElement('fsa', 'order-parts', { payload: productsPayload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "SVMXC__On_Hold__c": false
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportPagination();
  it('should test "where" search for order-parts', () => {
      let id;
      return cloud.post(test.api, productsPayload)
        .then(r => id = r.body.id)
        .then(r => cloud.get(test.api), { qs: {  where:  `Id =\'${id}\'` } })
        .then(r => cloud.delete(`${test.api}/${id}`));
    });

});
