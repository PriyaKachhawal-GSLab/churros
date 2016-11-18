'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('crm', 'products', null, (test) => {
  test.should.supportSr(); 
  test.should.supportPagination();
  it('should support searching /hubs/crm/products by id ', () => {
  let id;
  return cloud.get(test.api)
      .then(r => id = r.body[0].id)
      .then(r => cloud.get(`${test.api}`),{ qs: { where:'id="${id}"' } });
  });
});
