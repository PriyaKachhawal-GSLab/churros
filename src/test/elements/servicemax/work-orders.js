'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/work-orders');

suite.forElement('fsa', 'work-orders', { payload: payload }, (test) => {

  test.should.supportCruds();
  test.should.supportPagination();
  it('should test "where" search for work-orders', () => {
      let id;
      return cloud.post(test.api, payload)
        .then(r => id = r.body.id)
        .then(r => cloud.get(test.api), { qs: {  where:  `Id =\'${id}\'` } })
        .then(r => cloud.delete(`${test.api}/${id}`));
    });
});
