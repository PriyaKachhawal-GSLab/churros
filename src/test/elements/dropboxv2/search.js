'use strict';
const suite = require('core/suite');
exports.search = () => {
  suite.forElement('documents', 'search', (test) => {

    test.withOptions({ qs:{'text':'abc'}}).should.return200OnGet();
    test.should.supportNextPagePagination(1);
  });
};
