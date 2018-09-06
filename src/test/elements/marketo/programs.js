'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/programs-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/programs-update.json`);

suite.forElement('marketing', 'programs', { payload: payload }, (test) => {
  payload.name += tools.random();
  let id;
  const validMetadata = r => {
    expect(r).to.have.statusCode(200);
    let name = r.body.fields.find((obj) => { return obj.vendorPath === 'name'; });
    expect(name).to.not.be.null;
    expect(name.type).to.exist;
    expect(name.type).to.equal('string');
  };
  it('should allow CRUD for /programs', () => {
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
  it('should test metadata by id for programs', () => {
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.withOptions({ qs: { discoveryId: id } }).get('/objects/programs/metadata'))
      .then(r => validMetadata(r))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
