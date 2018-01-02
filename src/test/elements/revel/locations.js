const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const locationUpdatePayload = tools.requirePayload(`${__dirname}/assets/locationUpdate.json`);

suite.forElement('employee', 'locations', (test) => {

  before(() => {
    return cloud.get('/users')
      .then(r => {
        locationUpdatePayload.manager = r.body[0].resource_uri;
      });
  });

  it('Should allow SRU for locations', () => {
    let locationId, len;
    return cloud.get(test.api)
      .then(r => {
        len = r.body.length;
        locationId = r.body[len - 1].id;
      })
      .then(r => cloud.get(`${test.api}/${locationId}`))
      .then(r => cloud.patch(`${test.api}/${locationId}`, locationUpdatePayload));
  });
});
