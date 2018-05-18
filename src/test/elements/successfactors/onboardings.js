'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;


suite.forElement('Humancapital', 'onboardings', {skip: false}, (test) => {
  let id;
  it('should allow Sr for onboardings', () => {
    return cloud.get(test.api)
      .then(r => id = r.body[0].onboardingId)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.get(`${test.api}/${id}/statuses`));
  });
  it(`should allow CEQL search for ${test.api}`, () => {
    return cloud.withOptions({ qs: { where: `onboardingId='${id}'` } }).get(test.api)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.length).to.equal(1);
        expect(r.body[0].onboardingId).to.equal(id);
      });
  });
});
