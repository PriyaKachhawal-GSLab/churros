'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');

const payload = tools.requirePayload(`${__dirname}/assets/ledgerAccount.json`);
const build = (overrides) => Object.assign({}, payload, overrides);
const ledgerAccountPayload = build({ date: Date(), reference: "re" + tools.randomInt() });


suite.forElement('finance', 'ledger-accounts', { payload: ledgerAccountPayload },(test) => {
  test.should.supportCrs();
  test.should.supportPagination();
  test
    .withName(`should support searching ${test.api} by visible_in`)
    .withOptions({ qs: { where: `visible_in = 'banking'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.visible_in_banking = 'true');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
