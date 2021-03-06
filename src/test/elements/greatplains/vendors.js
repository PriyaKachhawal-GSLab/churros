const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/vendors.json`);

suite.forElement('finance', 'vendors', {payload:payload},(test) => {
    test.should.supportPagination();
    test.should.supportCruds();
    test.withApi(test.api)
    .withOptions({ qs: { where: `id='ACETRAVE0001'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
    .withName('should allow GET with option id')
    .should.return200OnGet();   
});