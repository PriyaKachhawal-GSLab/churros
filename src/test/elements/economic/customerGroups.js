'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const payload = tools.requirePayload(`${__dirname}/assets/customerGroups.json`);

suite.forElement('erp', 'customer-groups', { payload: payload }, (test) => {
  let Id;
  before(() => cloud.get('/hubs/erp/accounts')
    .then(r => Id = r.body[0].accountNumber));
  const options = {
    churros: {
      "name": "<<random.word>>",
      "account": {
        "accountNumber": Id
      }
    }
  };
  payload.customerGroupNumber=tools.randomInt();
  test.withOptions(options).should.supportCruds(chakram.put);
  test.should.supportNextPagePagination(1);
  test
     .withOptions({ qs: { where: `name = 'madhuri' ` } })
     .withName('should support Ceql name search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.name = 'madhuri');
       expect(validValues.length).to.equal(r.body.length);
     })
     .should.return200OnGet();

});
