'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;

suite.forElement('finance', 'ledger-accounts', (test) => {
    it(`should support RS for ${test.api}`, () => {
      let id;
       return cloud.get(`${test.api}`)
        .then(r => id = r.body[0].key.id)
        // var Id = encodeURI(id)
        .then(r => cloud.get(`${test.api}/${id}`));  
    });
    test.withApi(test.api)
    .withOptions({ qs: { where: `alias= '$OA'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
    .withName('should allow GET with option alias name')
    .should.return200OnGet();
    test.should.supportPagination();
   
  });
