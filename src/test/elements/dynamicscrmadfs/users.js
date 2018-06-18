'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('crm', 'users', null, (test) => {
  test.should.supportSr();
  test.should.supportPagination();
  it('should support searching /hubs/crm/users by id ', () => {
    let id;
    let actualid = "11411afe-2b69-e611-80dd-c4346bb5ebe0";
    return cloud.get(test.api)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}`), { qs: { where: 'id="${id}"' } });
      let Id="me";
      return cloud.get(test.api)
      .then(r => cloud.get(`${test.api}`), {qs:{where: 'id="${Id}"'}})
      .then(r => expect(r.body.id).to.equal(actualid));      
  });
});