'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/arAccountLabels.json`);

suite.forElement('finance', 'ar-account-labels', { payload: payload }, (test) => {
  const options = {
    churros: {
      updatePayload: {
        "DESCRIPTION": "Test"
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportNextPagePagination(2);
  it('should CEQL search with RECORDNO', () => {
    let recordNo;
    return cloud.get(test.api)
      .then(r => recordNo = r.body[0].RECORDNO)
      .then(r => cloud.withOptions({ qs: { where: `RECORDNO=${recordNo}` } }).get(test.api))
      .then(r => {
        expect(r).to.statusCode(200);
        expect(r.body.length).to.be.equal(1);
      });
  });
});
