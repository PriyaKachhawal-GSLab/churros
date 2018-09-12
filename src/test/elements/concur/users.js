'use strict';

const tools = require('core/tools');
const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const createpayload = tools.requirePayload(`${__dirname}/assets/users-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/users-update.json`);

suite.forElement('finance', 'users', { payload: createpayload }, (test) => {

  it('should support CRUS, pagination and Ceql searching for ${test.api}', () => {
    let id, ID, email;
    return cloud.post(test.api, createpayload)
     
      .then(r => cloud.get(test.api))
      .then (r => {
        email = r.body[0].PrimaryEmail;
        ID = r.body[0].LoginID;
        id = r.body[0].EmployeeID;
      })
      .then(r => cloud.withOptions({ qs: { where: `PrimaryEmail='${email}'` } }).get(test.api))
      .then(r => expect(r.body.filter(o => o.PrimaryEmail === `${email}`)).to.not.be.empty)
      .then(r => cloud.get(`${test.api}/${ID}`))
      .then(r => {
        updatePayload.EmployeeID = id;
        updatePayload.LoginId = ID;
        
      })
      .then(r => cloud.put(`${test.api}/${id}`, updatePayload));
  });
  test.should.supportPagination('id');
  
});



