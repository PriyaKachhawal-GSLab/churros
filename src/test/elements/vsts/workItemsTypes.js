const suite = require('core/suite');

suite.forElement('collaboration', 'work-items-types', (test) => {
  it('should allow RS for /work-items-types', () => {
  });
  test.should.supportSr();
  test.should.supportPagination();

});