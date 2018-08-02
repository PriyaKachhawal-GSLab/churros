const suite = require('core/suite');

suite.forElement('collaboration', 'users', (test) => {
  test.should.supportS();
  test.should.supportPagination();
});