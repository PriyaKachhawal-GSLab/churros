'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const payload = require('./assets/addresses');


suite.forElement('messaging', 'addresses', {payload: payload}, (test) => {
  test.should.supportCruds();
  test
     .withOptions({ qs: { where: `FriendlyName = 'Jack' ` } })
     .withName('should support Ceql FriendlyName search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.FriendlyName = 'Jack');
       expect(validValues.length).to.equal(r.body.length);
     })
     .should.return200OnGet();
});