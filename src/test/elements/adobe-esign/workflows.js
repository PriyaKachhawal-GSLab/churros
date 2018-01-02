'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

const createWorkflows = (transientDocumentId) => ({
  "documentCreationInfo": {
    "formFieldLayerTemplates": [{
      "transientDocumentId": transientDocumentId
    }],
    "locale": "",
    "name": tools.random(),
    "fileInfos": [{
      "transientDocumentId": transientDocumentId,
      "name": tools.random(),
      "workflowLibraryDocumentId": tools.random()
    }],
    "recipientsListInfo": [{
      "recipients": [{
        "email": tools.randomEmail()
      }],
      "name": tools.random()
    }]
  }
});

suite.forElement('esignature', 'workflows',  (test) => {
  test.should.supportSr();
//Need to skip as there is no delete API
  it.skip(`should allow POST for ${test.api}/{workflowId}/agreements`, () => {
    let workflowId;
    let transientDocumentId;
    return cloud.get(test.api)
      .then(r => workflowId = r.body[0].id)
      .then(r => cloud.postFile(`/hubs/esignature/transient-documents`, `${__dirname}/assets/attach.txt`))
      .then(r => transientDocumentId = r.body.id)
      .then(r => cloud.post(`${test.api}/${workflowId}/agreements`, createWorkflows(transientDocumentId)));
  });
});
