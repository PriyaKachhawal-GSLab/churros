'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const customTemplateCreatePayload = tools.requirePayload(`${__dirname}/assets/customTemplateCreate.json`);

suite.forElement('rewards', 'user-custom-templates', { payload: customTemplateCreatePayload }, (test) => {
  before(() => cloud.get('/hubs/rewards/touches')
    .then(r => {
      let touchId = r.body[0].id;
      customTemplateCreatePayload.custom_template.touch_id = touchId;
    }));

  test.should.supportPagination();
  
  it(`should allow CRUDS for ${test.api}`, () => {
    let customTempalteId;
    return cloud.post(`${test.api}`, customTemplateCreatePayload)
      .then(r => cloud.get(test.api))
      .then(r => customTempalteId = r.body[0].id)
      .then(r => cloud.get(`${test.api}/${customTempalteId}`))
      .then(r => cloud.put(`${test.api}/${customTempalteId}`, customTemplateCreatePayload))
      .then(r => cloud.delete(`${test.api}/${customTempalteId}`))
  });
});
