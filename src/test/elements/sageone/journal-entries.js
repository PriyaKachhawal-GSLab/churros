'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const payload = require('./assets/journal-entries');
const build = (overrides) => Object.assign({}, payload, overrides);
const journalPayload = build({ date: Date(), reference: "re" + tools.randomInt() });

suite.forElement('finance', 'journal-entries', { payload: journalPayload }, (test) => {
  let lastdate = '2017-05-11T10:26:55Z';
  test.should.supportCrs();
  test.should.supportPagination();
  test
    .withName(`should support searching ${test.api} by date`)
    .withOptions({ qs: { where: `lastModifiedDate >='${lastdate}'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.lastModifiedDate >= `${lastdate}`);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
