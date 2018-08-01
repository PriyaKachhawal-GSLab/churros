const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('collaboration', 'users', (test) => {
  it('should allow S for users', () => {
    test.should.supportS();
    test.should.return200OnGet();
  });
  test.should.supportPagination();
});
