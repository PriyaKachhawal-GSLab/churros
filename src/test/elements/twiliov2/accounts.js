'use strict';

const suite = require('core/suite');
const payload = require('./assets/addresses');
var chakram = require('chakram'),
    expect = chakram.expect;

suite.forElement('messaging', 'accounts', {payload: payload}, (test) => {
  test.should.supportSr();
  test
     .withOptions({ qs: { where: `FriendlyName = 'Jack' AND Status='suspended'` } })
     .withName('should support Ceql FriendlyName search')
     .withValidation(r => {
       expect(r).to.statusCode(200);
       const validValues = r.body.filter(obj => obj.FriendlyName = 'Jack');
       expect(validValues.length).to.equal(r.body.length);
     })
     .should.return200OnGet();
});
