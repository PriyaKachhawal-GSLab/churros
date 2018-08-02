const suite = require('core/suite');

suite.forElement('collaboration', 'work-items-fields', (test) => {
  test.should.supportSr();
  test.should.supportPagination();
});