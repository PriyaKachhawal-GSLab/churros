'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const R = require('ramda');

const vdrPayload = require('core/tools').requirePayload(`${__dirname}/assets/vdr.json`);
const transformationPayload = require('core/tools').requirePayload(`${__dirname}/assets/transformation.json`);
const schema = require('core/tools').requirePayload(`${__dirname}/assets/transformation.schema.json`);
const pluralSchema = require('core/tools').requirePayload(`${__dirname}/assets/transformations.schema.json`);
pluralSchema.definitions.transformation = schema;

// Adds the correct vdrFieldId to the transformation field by matching on the path and then removes the path
const addMatchingVdrFieldId = (vdrFields, tField) => {
    const matchingVdrField = R.find(R.propEq('path', tField.path))(vdrFields)
    return R.pipe(
        R.assoc('vdrFieldId', matchingVdrField.id),
        R.dissoc('path')
    )(tField)
};

suite.forPlatform('vdrs/{id}/transformations', {schema}, test => {
    let vdrId, updatePayload;
    before(() => {
      return cloud.post('/vdrs', vdrPayload)
        .then(r => {
            vdrId = r.body.id;
            // add the vdr field ids to each of the transformation fields
            transformationPayload.fields = R.map(f => addMatchingVdrFieldId(r.body.fields, f), transformationPayload.fields);

            // set the update payload to change the name and remove a field
            updatePayload = R.assoc('vendorName', 'updatedVendorName', transformationPayload);
            updatePayload.fields = R.dropLast(1, updatePayload.fields);
        });
    });
  
    after(() => {
        if (vdrId) cloud.delete(`/vdrs/${vdrId}`);
    });

    // NOTE - you need the 'vdrAdmin' role to run these tests
    it('should test CRUDS for vdr transformations', () => {
        return cloud.withOptions({churros: {updatePayload}})
            .crud(`/vdrs/${vdrId}/transformations`, transformationPayload, schema, chakram.put)
            .then(r => cloud.get(`/vdrs/${vdrId}/transformations`, pluralSchema));
    });
});
