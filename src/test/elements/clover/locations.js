const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const locationsUpdatePayload = tools.requirePayload(`${__dirname}/assets/locationsUpdate.json`);

suite.forElement('employee', 'locations', (test) => {

  it('should allow SU for locations', () => {
    return cloud.get(test.api)
      .then(r => cloud.patch(test.api, locationsUpdatePayload))
      .then(r => expect(r.body.name).to.equal('Atul'));
  });
});
