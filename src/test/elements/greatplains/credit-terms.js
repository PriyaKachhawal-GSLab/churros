'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

const expect = require('chakram').expect;

suite.forElement('finance', 'credit-terms', (test) => {
  test.should.supportPagination();
    it(`should support RS for ${test.api}`, () => {
      let id;
      return cloud.get(test.api)
        .then(r => id = r.body[0].id)
        .then(r => cloud.get(`${test.api}/${id}`));
    });
    
    test.withApi(test.api)
    .withOptions({ qs: { where: `id='2% 10/Net 30'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
    .withName('should allow GET with option id')
    .should.return200OnGet();

    
  });
