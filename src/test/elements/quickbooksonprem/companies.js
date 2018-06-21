const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
suite.forElement('finance', 'companies', (test) => {
    test.withApi(test.api);
    test.should.supportS()
});