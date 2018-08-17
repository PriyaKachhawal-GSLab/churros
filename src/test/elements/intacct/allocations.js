'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/allocations.json`);

suite.forElement('finance', 'allocations', { payload: payload }, (test) => {
  const modifiedDate = '08/14/2018 06:25:04';
  const options = {
    churros: {
      updatePayload: {
        "ALLOCATIONENTRIES": {
          "lineitem": [{
            "VALUE": "100"
          }]
        }
      }
    }
  };
  test.withOptions(options).should.supportCruds();
  test.should.supportNextPagePagination(2);
  test.withOptions({ qs: { where: `WHENMODIFIED ='${modifiedDate}'` } })
    .withName('should support Ceql WHENMODIFIED search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.WHENMODIFIED = modifiedDate);
      expect(validValues.length).to.equal(r.body.length);
    }).should.return200OnGet();
});
