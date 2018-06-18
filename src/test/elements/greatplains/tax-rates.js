'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
suite.forElement('finance', 'tax-rates', (test) => {
    it(`should support RS for ${test.api}`, () => {
      let id;
      return cloud.get(`${test.api}`)
    
       
        .then(r => id = r.body[0].taxDetailKey.id)
        
        .then(r => cloud.get(`${test.api}/${id}`));
    });
    test.withApi(test.api)
    .withOptions({ qs: { where: `taxDetailKeyId='AUSSTE+PS0N0'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.taxDetailKey.id !== "")).to.not.be.empty)
    .withName('should allow GET with option taxDetailKeyId')
    .should.return200OnGet();
    test.should.supportPagination()
  });
