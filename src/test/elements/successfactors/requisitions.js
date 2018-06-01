'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/JobRequisition.json`);

const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('Humancapital', 'requisitions', { payload: payload }, (test) => {
  let id;
  
  const options = {
    churros: {
      updatePayload: { "location": "Auckland (NZ01-0001)" }
    }
  };

  test.withOptions(options).should.supportCrus();
   it(`should allow CEQL search for ${test.api}`, () => {
    return cloud.get(`${test.api}`) 
      .then(r => id = r.body[0].id)
      .then(r => cloud.withOptions({ qs: { where: `jobReqId='${id}'` } }).get(test.api))
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.length).to.equal(1);
        expect(r.body[0].id).to.equal(id);
      });
  });
  test.should.supportPagination();
});
