const suite = require('core/suite');

suite.forElement('humancapital', 'users', (test) => {

    test.should.supportPagination();
    test.should.supportS();
});
