const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;


suite.forElement('finance', 'classes',(test) => {
    test.withApi(test.api)
    .withOptions({ qs: { where: `description='COMPONENTS'` } })
    .withValidation(r => expect(r.body.filter(obj => obj.key.id !== "")).to.not.be.empty)
    .withName('should allow GET with option description')
    .should.return200OnGet();
    test.should.supportSr();

});
