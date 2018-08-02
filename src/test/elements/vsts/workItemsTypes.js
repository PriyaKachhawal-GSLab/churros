const suite = require('core/suite');

suite.forElement('collaboration', 'work-items-types', (test) => {
  test.should.supportSr();
  test.should.supportPagination();

});