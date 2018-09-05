'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('crm', 'leads', (test) => {
    let FirstName='MyFirstName'
    test.should.supportS();
    test.should.supportPagination();
    test.withApi(test.api)
      .withOptions({ qs: { where: `FirstName='${FirstName}'`, fields: `Email.Description,SecStatus.CanUpdate` } })
      .withValidation(r => {
         expect(r.body.filter(obj => obj.FirstName === `${FirstName}`).length).to.equal(r.body.length);
         expect(Object.keys(r.body[0]).length).to.equal(2);
      });
});

