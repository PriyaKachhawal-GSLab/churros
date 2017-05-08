'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = require('./assets/field-trip-object-analyses');
const build = (overrides) => Object.assign({}, payload, overrides);
const fieldObjectAnalysesPayload = build({Name: "name" + tools.randomInt(),FieldTripObjectLabel: "label" + tools.randomInt()});

suite.forElement('finance', 'field-trip-object-analyses',{ payload:fieldObjectAnalysesPayload } , (test) => {
  let name ;
    test.should.supportCrds();
    test.should.supportPagination();
    it(`should support GET ${test.api}`, () => {
      return cloud.get(test.api)
        .then(r => name = r.body[0].Name);
      });
      test
       .withName(`should support searching ${test.api} by Name`)
       .withOptions({ qs: { where:`Name  ='${name}'`} })
       .withValidation((r) => {
       expect(r).to.have.statusCode(200);
       const validValues = r.body.filter(obj => obj.Name === `${name}`);
       expect(validValues.length).to.equal(r.body.length);
     }).should.return200OnGet();
    });
