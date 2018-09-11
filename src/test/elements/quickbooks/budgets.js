'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
suite.forElement('finance', 'budgets', (test) => {
  it('should support SR, pagination and Ceql searching for ${test.api}', () => {
    let id ;    
    return cloud.get(test.api)
    .then(r => id = r.body[0].id)
    .then(r => cloud.withOptions({ qs: { where: `active='true'` } }).get(test.api))
    .then(r => expect(r.body.filter(o => o.active === true)).to.not.be.empty)
    .then(r => cloud.get(`${test.api}/${id}`)); 
  });
  test.should.supportPagination('id');
});



