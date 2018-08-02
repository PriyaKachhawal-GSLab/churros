'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const addressModel = require('./assets/models/address.json');
const contactModel = require('./assets/models/contact.json');
const leadModel = require('./assets/models/lead.json');
const statusModel = require('./assets/models/status.json');
const R = require('ramda');

const chakram = require('chakram');
const expect = chakram.expect;

suite.forPlatform('elements/models', {}, (test) => {
  let elementId, addressModelId, statusModelId;

  before(() => cloud.get(`elements/closeio`)
    .then(r => elementId = r.body.id)
    .then(() => cloud.post(`/elements/${elementId}/models`, addressModel))
    .then(r => addressModelId = r.body.id)
    .then(() => cloud.post(`/elements/${elementId}/models`, statusModel))
    .then(r => statusModelId = r.body.id));

  after(() => cloud.delete(`elements/${elementId}/models/${addressModelId}`)
    .then(() => cloud.delete(`elements/${elementId}/models/${statusModelId}`)));

  it.skip('should managing relationships correctly when referencing related models in the sampleValue of model fields', () => {
    let contactModelId, leadModelId;

    contactModel.modelFields = [{
        "vendorName": "churrosVendorStatusId",
        "dataType": {
            "jsonType": "string",
            "format": "string"
        },
        "sampleValue": "$churrosStatus.id",
        "foreignKey": true,
        "relatedModelId": statusModelId
    },
    {
        "vendorName": "churrosVendorStatusLabel",
        "dataType": {
            "jsonType": "string",
            "format": "string"
        },
        "sampleValue": "$churrosStatus.label",
        "foreignKey": false,
        "relatedModelId": statusModelId
    },
    {
        "vendorName": "churrosVendorAddress",
        "dataType": {
            "jsonType": "object",
            "format": "object"
        },
        "sampleValue": "$churrosContactAddress",
        "relatedModelId": addressModelId
    }];

    const contactLeadIdField = leadId => {
        return {
            "vendorName": "churrosContactLeadId",
            "dataType": {
                "jsonType": "string",
                "format": "string"
            },
            "sampleValue": "$churrosLead.id",
            "relatedModelId": leadModelId
        };
    };

    const addFieldToPutPayload = (body, field, fields) => {
        return Object.assign(body, {
            modelFields: R.append(field, fields),
        });
    };

    const removeFieldFromPutPayload = (body, fieldName, fields) => {
        const fieldToRemove = R.find(R.propEq('vendorName', fieldName))(fields);
        return Object.assign(body, {
            modelFields: R.without([fieldToRemove], fields),
        });
    };

    const contactValidator = r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.childModelIds).to.include(addressModelId);
        expect(r.body.childModelIds).to.include(statusModelId);
    };

    const leadValidator = r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.childModelIds).to.include(addressModelId);
        expect(r.body.childModelIds).to.include(statusModelId);
        expect(r.body.childModelIds).to.include(contactModelId);
    };

    const contactValidatorParent = r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.childModelIds).to.include(addressModelId);
        expect(r.body.childModelIds).to.include(statusModelId);
        expect(r.body.parentModelIds).to.include(leadModelId);
    };

    const contactValidatorCircular = r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.childModelIds).to.include(addressModelId);
        expect(r.body.childModelIds).to.include(statusModelId);
        expect(r.body.childModelIds).to.include(leadModelId);
        expect(r.body.childModelIds.length).to.equal(3);
        expect(r.body.parentModelIds).to.include(leadModelId);
    };

    const validatorNoAddress = r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.childModelIds).to.not.include(addressModelId);
        expect(r.body.childModelIds).to.include(statusModelId);
    };

    return cloud.post(`/elements/${elementId}/models`, contactModel)
        .then(r => {
            contactModelId = r.body.id;
            leadModel.modelFields[0].relatedModelId = contactModelId;
        })
        .then(() => cloud.get(`/elements/${elementId}/models/${contactModelId}`, contactValidator))
        .then(() => cloud.post(`/elements/${elementId}/models`, leadModel))
        .then(r => leadModelId = r.body.id)
        .then(() => cloud.get(`/elements/${elementId}/models/${leadModelId}`, leadValidator))
        .then(() => cloud.get(`/elements/${elementId}/models/${contactModelId}`, contactValidatorParent))

        // test a circular reference
        .then(r => cloud.put(`/elements/${elementId}/models/${contactModelId}`, addFieldToPutPayload(r.body, 
            contactLeadIdField(leadModelId), r.body.modelFields)))
        .then(() => cloud.get(`/elements/${elementId}/models/${contactModelId}`, contactValidatorCircular))

        // test removing a field with relationship and ensure its removed from parent and all top parents
        .then(r => cloud.put(`/elements/${elementId}/models/${contactModelId}/fields`, removeFieldFromPutPayload(r.body,
            'churrosVendorAddress', r.body.modelFields)))
        .then(() => cloud.get(`/elements/${elementId}/models/${contactModelId}`, validatorNoAddress))
        .then(() => cloud.get(`/elements/${elementId}/models/${leadModelId}`, validatorNoAddress))

        .then(() => cloud.delete(`elements/${elementId}/models/${contactModelId}`))
        .then(() => cloud.delete(`elements/${elementId}/models/${leadModelId}`))
        .catch(e => {
            if (contactModelId) { cloud.delete(`elements/${elementId}/models/${contactModelId}`); }
            if (leadModelId) { cloud.delete(`elements/${elementId}/models/${leadModelId}`); }
            throw e;
        });
  });
});
