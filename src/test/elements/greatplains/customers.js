const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/customers.json`);

suite.forElement('finance', 'customers', {payload:payload},(test) => {
    test.should.supportPagination();
    test.should.supportCruds();
    test.withApi(test.api)    
    .withOptions({ qs: { where: `lastModifiedDate>'2014-01-15T00:00:00.000Z'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
    .withName('should allow GET with option modifiedTime')
    .should.return200OnGet();
    
   
});
