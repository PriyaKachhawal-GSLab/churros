const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('finance', 'classes',(test) => {
    test.should.supportSr();
    test.withApi(test.api)
    .withOptions({ qs: { where: `description='COMPONENTS'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
    .withName('should allow GET with option description')
    .should.return200OnGet();
   

});
