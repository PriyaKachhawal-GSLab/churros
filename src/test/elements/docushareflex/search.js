const suite = require('core/suite');

suite.forElement('documents', 'search', (test) => {
  test.should.return200OnGet();

  test.should.supportNextPagePagination(1);
});