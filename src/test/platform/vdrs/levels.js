'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const R = require('ramda');
const expect = require('chakram').expect;

const payload = require('core/tools').requirePayload(`${__dirname}/assets/vdr.json`);
const schema = require('core/tools').requirePayload(`${__dirname}/assets/vdr.schema.json`);
const pluralSchema = require('core/tools').requirePayload(`${__dirname}/assets/vdrs.schema.json`);
pluralSchema.definitions.vdr = schema;

suite.forPlatform('v1-vdrs', {payload, schema}, test => {

  const updatePayload = () => {
    let up = payload;
    up.fields = R.dropLast(1, up.fields);
    up.fields[0].path = 'anUpdateField';
    up.fields.push({type: 'string', path: 'aNewField', level: 'system'});
    return up;
  };

  const dictionary = {}
  dictionary[payload.objectName] = payload;


  it('should support CRUDS for organization level VDRs using the /organizations/{objectName} APIs on v1 or v2', () => {
    return cloud.post(`/organizations/objects/${payload.objectName}/definitions`, payload, schema)
        .then(() => cloud.get(`/organizations/objects/${payload.objectName}/definitions`, schema))
        .then(() => cloud.put(`/organizations/objects/${payload.objectName}/definitions`, updatePayload(), schema))
        .then(() => cloud.patch(`/organizations/objects/${payload.objectName}`, {objectName: 'newObjectnameChurros'}, r => expect(r.body.objectName).to.equal('newObjectnameChurros')))
        .then(r => cloud.delete(`/organizations/objects/${r.body.objectName}/definitions`));
  });

  it('should support CRD for organization level VDRs using the /organizations/objects/definitions APIs on v1 or v2', () => {
    return cloud.post(`/organizations/objects/definitions`, dictionary)
        .then(() => cloud.get(`/organizations/objects/definitions`, r => expect(R.has(payload.objectName, r.body)).to.be.true))
        .then(r => cloud.delete(`/organizations/objects/definitions`))
        .then(() => cloud.get(`/organizations/objects/definitions`, r => expect(r).to.have.statusCode(404)));
  });
});
