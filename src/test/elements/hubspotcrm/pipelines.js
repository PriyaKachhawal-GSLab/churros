'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/pipelines.json`);

suite.forElement('crm', 'pipelines', { payload: payload }, (test) => {


  it(`should allow CRUDS for ${test.api}`, () => {
    const updatePayload = {
      "pipelineId": "",
      "label": "Temp",
      "displayOrder": 10,
      "stages": [{
        "label": "temp",
        "displayOrder": 12,
        "probability": 0.1
      }]
    };
    let pipelineId;

    return cloud.get(test.api)
      .then(r => cloud.post(test.api, payload))
      .then(r => {
        pipelineId = r.body.pipelineId;
        updatePayload.pipelineId = pipelineId;
      })
      .then(r => cloud.get(`${test.api}/${pipelineId}`))
      .then(r => cloud.patch(`${test.api}/${pipelineId}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${pipelineId}`));
  });
  test.should.supportPagination();

});
