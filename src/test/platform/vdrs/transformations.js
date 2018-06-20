'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const R = require('ramda');

const tools = require('core/tools');

const vdrPayload = tools.requirePayload(`${__dirname}/assets/vdr.system.json`);
const transformationPayload = tools.requirePayload(`${__dirname}/assets/transformation.json`);
const schema = tools.requirePayload(`${__dirname}/assets/transformation.schema.json`);
const pluralSchema = tools.requirePayload(`${__dirname}/assets/transformations.schema.json`);
pluralSchema.definitions.transformation = schema;

// Adds the correct vdrFieldId to the transformation field by matching on the path and then removes the path
const addMatchingVdrFieldId = (vdrFields, tField) => {
    const matchingVdrField = R.find(R.propEq('path', tField.path))(vdrFields);
    return R.pipe(
        R.assoc('vdrFieldId', matchingVdrField.id),
        R.dissoc('path')
    )(tField);
};

suite.forPlatform('vdrs/{id}/transformations', {schema}, test => {
    let vdrId, updatePayload;
    before(() => {
      return cloud.post('/vdrs?systemOnly=true', vdrPayload)
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
        if (vdrId) cloud.delete(`/vdrs/${vdrId}?systemOnly=true`);
    });

    // NOTE - you need the 'vdrAdmin' role to run these tests
    it('should test CRUDS for vdr transformations', () => {
        return cloud.withOptions({churros: {updatePayload}})
            .crud(`/vdrs/${vdrId}/transformations`, transformationPayload, schema, chakram.put)
            .then(r => cloud.get(`/vdrs/${vdrId}/transformations`, pluralSchema));
    });

    it('should return a list of mapped element ids on a VDR when a transformation exists', () => {
        let transformationId;
    
        const validator = r => {
          expect(r).to.have.statusCode(200);
          expect(r.body.mappedElementIds).to.have.length(1);
        };
    
        return cloud.post(`/vdrs/${vdrId}/transformations`, transformationPayload)
            .then(r => transformationId = r.body.id)
            .then(() => cloud.get(`/vdrs/${vdrId}`, validator))
            .then(() => cloud.delete(`/vdrs/${vdrId}/transformations/${transformationId}`));
    });

    it('should support cloning a VDR and its transformations from the system catalog to the user\'s account', () => {
        let accountId, transformationId;
        const newObjectName = `myNewObjectName-${tools.randomStr('string', 6)}`;
  
        return cloud.post(`/vdrs/${vdrId}/transformations`, transformationPayload)
            .then(r => transformationId = r.body.id)
            // test a basic clone
            .then(() => cloud.post(`/vdrs/${vdrId}/clone`, {}))
            .then(() => cloud.get(`/accounts/objects/${vdrPayload.objectName}/definitions`))
            // test cloning with a new objectName and including transformations
            .then(() => cloud.post(`/vdrs/${vdrId}/clone?cloneAllTransformations=true`, {objectName: newObjectName}))
            .then(() => cloud.get(`/accounts/objects/${newObjectName}/definitions`))
            .then(() => cloud.get(`/accounts`)) //get the user's accountId (assuming they are the default account)
            .then(r => r.body.forEach(account => accountId = (account.defaultAccount) ? accountId = account.id : accountId))
            .then(() => cloud.get(`/accounts/${accountId}/elements/${transformationPayload.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.delete(`/accounts/${accountId}/elements/${transformationPayload.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.delete(`/accounts/objects/${vdrPayload.objectName}/definitions`))
            .then(() => cloud.delete(`/accounts/objects/${newObjectName}/definitions`))
            .then(() => cloud.delete(`/vdrs/${vdrId}/transformations/${transformationId}`));
      });

    it('should support cloning a subset of transformations by elementKey', () => {
        let accountId;
        let transformationIds = [];
        const newObjectName = vdrPayload.objectName;

        const transformationOne = transformationPayload;
        const transformationTwo = R.assoc('elementKey', 'sfdc', transformationPayload);
        const transformationThree = R.assoc('elementKey', 'hubspotcrm', transformationPayload);

        const expectEmpty = r => {
            expect(r).to.have.statusCode(404);
        };

        return cloud.post(`/vdrs/${vdrId}/transformations`, transformationPayload)
            .then(r => transformationIds.push(r.body.id))
            .then(()=> cloud.post(`/vdrs/${vdrId}/transformations`, transformationTwo))
            .then(r => transformationIds.push(r.body.id))
            .then(()=> cloud.post(`/vdrs/${vdrId}/transformations`, transformationThree))
            .then(r => transformationIds.push(r.body.id))
            // Test cloning two of the three mapped elements
            .then(() => cloud.post(`/vdrs/${vdrId}/clone?elementKeys[]=${transformationTwo.elementKey}&elementKeys[]=${transformationOne.elementKey}`, {}))
            .then(() => cloud.get(`/accounts/objects/${newObjectName}/definitions`))
            // Get the default account id
            .then(() => cloud.get(`/accounts`)) 
            .then(r => r.body.forEach(account => accountId = (account.defaultAccount) ? accountId = account.id : accountId))
            // Validate that the transformation was clone correctly
            .then(() => cloud.get(`/accounts/${accountId}/elements/${transformationOne.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.get(`/accounts/${accountId}/elements/${transformationTwo.elementKey}/transformations/${newObjectName}`))
            // Validate only the first two element trasformations were cloned
            .then(() => cloud.get(`/accounts/${accountId}/elements/${transformationThree.elementKey}/transformations/${newObjectName}`, expectEmpty))
            // Cleanup
            .then(() => cloud.delete(`/accounts/${accountId}/elements/${transformationOne.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.delete(`/accounts/${accountId}/elements/${transformationTwo.elementKey}/transformations/${newObjectName}`))
            .then(() => cloud.delete(`/accounts/objects/${newObjectName}/definitions`))
            .then(() => transformationIds.forEach(id => {
                cloud.delete(`/vdrs/${vdrId}/transformations/${id}`);
            }));
    });
});
