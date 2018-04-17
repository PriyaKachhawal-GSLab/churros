const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('documents', 'search', (test) => {
  test.should.return200OnGet();

  test.should.supportNextPagePagination(1);

  it('should support searching by classType fields', () => {
    return cloud.withOptions({qs: {where: '`com.xerox.xcm.falcon.Invoice:invoiceNumber` = 151515'}}).get(test.api)
    .then(r => expect(r.body[0].properties.invoiceNumber).to.equal('151515'));
  })
});