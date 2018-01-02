'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

//Pagination is not working for element
suite.forElement('finance', 'tax-rates', null, (test) => {
  it('should support S for /hubs/finance/tax-rates', () => {
    return cloud.get(test.api);
  });
  test.should.supportPagination();
});
