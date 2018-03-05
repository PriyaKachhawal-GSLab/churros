'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const payload = require('./assets/work-orders');

suite.forElement('fsa', 'work-orders', { payload: payload }, (test) => {

  test.should.supportCruds();
  test.should.supportPagination();
  it('should test "where" search for work-orders', () => {
    let id;
    return cloud.post(test.api, payload)
      .then(r => {
        id = r.body.id;
        const myOptions = {qs: { where:  `Id =\'${id}\'`}};
        return cloud.withOptions(myOptions).get(test.api, (r) => {
          expect(r).to.have.statusCode(200);
          expect(r.body.filter(obj => obj.Id === id).length).to.equal(r.body.length);
        });
      })
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
