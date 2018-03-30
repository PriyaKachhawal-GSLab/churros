'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const R = require('ramda');

const payload = require('core/tools').requirePayload(`${__dirname}/assets/vdr.json`);
const schema = require('core/tools').requirePayload(`${__dirname}/assets/vdr.schema.json`);
const pluralSchema = require('core/tools').requirePayload(`${__dirname}/assets/vdrs.schema.json`);
pluralSchema.definitions.vdr = schema;

suite.forPlatform('vdrs', {payload, schema}, test => {

  const genUpdatePayload = (payload, newFields) => {
    let up = R.assoc('objectName', 'updatedObjectName2', payload);
    up.fields = newFields;
    up.fields = R.dropLast(1, up.fields);
    up.fields[0].path = 'anUpdateField';
    up.fields.push({type: 'string', path: 'aNewField', level: 'system'});
    return up;
  };

  // NOTE - you need the 'vdrAdmin' role to run these tests
  it('should support CRUDS for VDRs', () => {
    let vdrId, updatePayload;
    return cloud.post('/vdrs', payload, schema)
        .then(r => {
            vdrId = r.body.id;
            updatePayload = genUpdatePayload(payload, r.body.fields);
        })
        .then(() => cloud.get(`/vdrs/${vdrId}`, schema))
        .then(() => cloud.get(`/vdrs`, pluralSchema))
        .then(() => cloud.put(`/vdrs/${vdrId}`, updatePayload, schema))
        .then(() => cloud.delete(`/vdrs/${vdrId}`));
  });
});
