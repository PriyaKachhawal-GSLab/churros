'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const addressModel = require('./assets/models/address.json');
const contactModel = require('./assets/models/contact.json');
const leadModel = require('./assets/models/lead.json');
const statusModel = require('./assets/models/status.json');

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

  it('should support referencing a related model in the sampleValue of model fields', () => {
    let contactModelId, leadModelId;
    contactModel.fields = [{
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

    const contactValidator2 = r => {
        expect(r).to.have.statusCode(200);
        expect(r.body.childModelIds).to.include(addressModelId);
        expect(r.body.childModelIds).to.include(statusModelId);
        expect(r.body.parentModelIds).to.include(leadModelId);
    };

    return cloud.post(`/elements/${elementId}/models`, contactModel)
        .then(r => {
            contactModelId = r.body.id;
            leadModel.fields[0].relatedModelId = contactModelId;
        })
        .then(() => cloud.get(`/elements/${elementId}/models/${contactModelId}`, contactValidator))
        .then(() => cloud.post(`/elements/${elementId}/models`, leadModel))
        .then(r => leadModelId = r.body.id)
        .then(() => cloud.get(`/elements/${elementId}/models/${leadModelId}`, leadValidator))
        .then(() => cloud.get(`/elements/${elementId}/models/${contactModelId}`, contactValidator2))
        .then(() => cloud.delete(`elements/${elementId}/models/${contactModelId}`))
        .then(() => cloud.delete(`elements/${elementId}/models/${leadModelId}`))
        .catch(e => {
            if (contactModelId) { cloud.delete(`elements/${elementId}/models/${contactModelId}`); }
            if (leadModelId) { cloud.delete(`elements/${elementId}/models/${leadModelId}`); }
            throw e;
        });
  });
});
