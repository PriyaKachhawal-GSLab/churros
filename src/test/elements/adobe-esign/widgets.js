'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

/* jshint unused:false */
const createWidget = (transientDocumentId) => ({
  "widgetCreationInfo": {
    "fileInfos": [{
      "transientDocumentId": transientDocumentId
    }],
    "name": tools.random(),
    "signatureFlow": "SENDER_SIGNATURE_NOT_REQUIRED"
  }
});

const updateWidgetPersonalize = () => ({
  "email": tools.randomEmail()
});

const updateWidgetStatus = () => ({
  "message": "Testing widget status",
  "value": "ENABLE"
});

suite.forElement('esignature', 'widgets', {skip: false}, (test) => {
  /*
  // This script breaks, as there are over 700 widgets which leads to time-out
    test.should.return200OnGet();
  */
  /*
  //Commented out this block to avoid all posts, instead hardcoded the widgetId of a widget in the Adobe Esign
  // named "DoNotDeleteThisWidgetThisIsForChurrosTesting".
    let transientDocumentId, widgetId;
    before(() => cloud.postFile(`/hubs/esignature/transient-documents`, `${__dirname}/assets/attach.txt`)
      .then(r => transientDocumentId = r.body.id)
      .then(r => cloud.post(test.api, createWidget(transientDocumentId)))
      .then(r => widgetId = r.body.id));
  */
  let widgetId = "3AAABLblqZhA_ZRfpH6d0l0tD8pnUXG-UWi0Xe0gtQ8dRJCvFzbQyMxiEyzUXcUWIi-xrslmcBBTlqU0DOukS_31TmSaqCck9";
  /*
  // Commented the POST for this resource to avoid creation of new Widgets, since the code
  // breaks for GET /widgets due to time-out. Also there is no DELETE API for widgets
    it(`should allow POST for ${test.api}`, () => {
      return cloud.postFile('/hubs/esignature/transientDocuments', __dirname + '/assets/attach.txt')
        .then(r => transientDocumentId = r.body.id)
        .then(r => cloud.post(test.api, createWidget(transientDocumentId)))
    });
  */
  it(`should allow GET ${test.api}/{widgetId}`, () => {
    return cloud.get(`${test.api}/${widgetId}`);
  });
  it(`should allow GET ${test.api}/{widgetId}/agreements`, () => {
    return cloud.get(`${test.api}/${widgetId}/agreements`);
  });
  it(`should allow GET ${test.api}/{widgetId}/audits`, () => {
    return cloud.get(`${test.api}/${widgetId}/audits`);
  });
  it(`should allow GET ${test.api}/{widgetId}/combined-documents`, () => {
    return cloud.get(`${test.api}/${widgetId}/combined-documents`);
  });
  it(`should allow GET ${test.api}/{widgetId}/documents`, () => {
    return cloud.get(`${test.api}/${widgetId}/documents`);
  });
  it(`should allow GET ${test.api}/{widgetId}/documents/{documentId}`, () => {
    let documentId;
    return cloud.get(`${test.api}/${widgetId}/documents`)
      .then(r => documentId = r.body.id)
      .then(r => cloud.get(`${test.api}/${widgetId}/documents/${documentId}`));
  });
  it(`should allow GET ${test.api}/{widgetId}/data`, () => {
    return cloud.get(`${test.api}/${widgetId}/data`);
  });
  it(`should allow PATCH for ${test.api}/{widgetId}/signable-documents`, () => {
    return cloud.patch(`${test.api}/${widgetId}/signable-documents`, updateWidgetPersonalize());
  });
  it(`should allow PATCH for ${test.api}/{widgetId}/statuses`, () => {
    return cloud.patch(`${test.api}/${widgetId}/statuses`, updateWidgetStatus());
  });
});
