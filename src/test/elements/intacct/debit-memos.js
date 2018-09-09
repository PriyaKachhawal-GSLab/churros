'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

const debitMemosCreatePayload = tools.requirePayload(`${__dirname}/assets/debit-memos-create.json`);

suite.forElement('finance', 'debit-memos', { payload: debitMemosCreatePayload }, (test) => {
  test.should.supportCrs();
  test.should.supportPagination();
  test.withName('should support vendorid= V102 Ceql search')
  .withOptions({ qs: { where: ' vendorid=\'V102\'' } })
  .withValidation(r => {
    expect(r).to.statusCode(200);
    const validValues = r.body.filter(obj => obj.vendorid = 'V102');
    expect(validValues.length).to.equal(r.body.length);
  }).should.return200OnGet();
});
