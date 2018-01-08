'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;


suite.forElement('finance', 'bills-payments', null, (test) => {

 let id;
 test.should.supportSr();
 test
    .withOptions({ qs: { where: `WHENMODIFIED > '06/23/2013 14:25:17'` } })
    .withName('should support Ceql date search')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.WHENMODIFIED >= '06/23/2013 14:25:17');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
    test.should.supportNextPagePagination(1,false);

});
