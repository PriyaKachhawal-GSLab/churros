'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);
const updatePayload=tools.requirePayload(`${__dirname}/assets/UpdateCustomFieldTemplate.json`);
suite.forElement('documents', 'custom-fields-templates', (test) => {

  it('should support CRUS for /custom-fields-templates/templates', () => {
    let tempKey;
    return cloud.post(`${test.api}`, temPayload)
      .then(r => tempKey = r.body.templateKey)
      .then(r => cloud.put(`${test.api}/${tempKey}`, updatePayload))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).get(`${test.api}/${tempKey}`))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).get(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).delete(`${test.api}/${tempKey}`));
  });
  
  it('should support CRUS for /custom-fields-templates/templates', () => {
    return cloud.get(`${test.api}/enterprise-templates`);
  });

});
