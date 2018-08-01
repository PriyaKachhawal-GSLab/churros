const suite = require('core/suite');

suite.forElement('collaboration', 'work-items-fields', (test) => {
  it('should allow RS for work-items-fields', () => {
    test.should.supportSr();
    test.should.supportPagination();
  });
});