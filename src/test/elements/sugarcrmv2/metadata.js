'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const objects = require('./assets/metadata');

suite.forElement('finance', `objects`, (test) => {
  return Promise.all(objects.map(obj => {
    it(`should support GET ${test.api}/${obj}/metadata`, () => {
      return cloud.get(`${test.api}/${obj}/metadata`)
      then(r => expect(r.body.fields).to.not.be.empty);
    });

    test
      .withName(`should support GET ${test.api}/${obj}/metadata customFieldsOnly parameter`)
      .withApi(`${test.api}/${obj}/metadata`)
      .withOptions({ qs: { customFieldsOnly: true } })
      .withValidation((r) => {
        expect(r).to.have.statusCode(200);
        const validValues = r.body.fields.filter(field => (field.vendorPath.endsWith("_c") && field.custom === true));
        expect(validValues.length).to.equal(r.body.fields.length);
      }).should.return200OnGet();
  }));
});
