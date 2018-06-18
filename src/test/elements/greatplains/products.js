'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
suite.forElement('finance', 'products', (test) => {
    it(`should support RS for ${test.api}`, () => {
      let id;
      return cloud.get(`${test.api}`)
    
        
        .then(r => id = r.body[6].key.id)
        
        .then(r => cloud.get(`${test.api}/${id}`));
    });
    test.withApi(test.api)
    .withOptions({ qs: { where: `lastModifiedDate>='2014-01-15T00:00:00.000Z'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
    .withName('should allow GET with option lastModifiedDate')
    .should.return200OnGet();
    test.should.supportPagination();
  });
