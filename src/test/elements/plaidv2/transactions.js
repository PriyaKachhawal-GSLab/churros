'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('finance', 'transactions', (test) => {
  test.withName(`should support searching ${test.api} by date`)
    .withOptions({ qs: { where: `date > '2014-07-21'` } })
    .withValidation((r) => {
      expect(r).to.have.statusCode(200);
      const validValues = r.body.filter(obj => obj.date > '2014-07-21');
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();

  test.should.supportPagination();

  let opts = {
    json: true,
    csv: true
  };

  test.should.supportBulkDownload({
    qs: {
      q: 'select * from transactions limit 200'
    }
  }, opts, 'transactions')
});
