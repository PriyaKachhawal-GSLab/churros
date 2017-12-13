'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;


suite.forElement('finance', 'bills-payments', null, (test) => {
  
 let id;
  it(`should allow GET for ${test.api}`, () => {
  return cloud.get(`${test.api}`)
    .then(r => {
      if (r.body.length <= 0) {
        return;
      } else {
        id = r.body[0].RECORDNO;
        return cloud.get(`${test.api}/${id}`);
      }
    });});
  if (id !== null) {



 return cloud.withOptions({ qs: { where: 'whenmodified>\'08/13/2016 05:26:37\'' } })
        .get(test.api)
        .then((r) => {
          expect(r).to.statusCode(200);
          const validValues = r.body.filter(obj =>
            obj.whenmodified >= '08/13/2016 05:26:37');
          expect(validValues.length).to.equal(r.body.length);
        });

}

});
