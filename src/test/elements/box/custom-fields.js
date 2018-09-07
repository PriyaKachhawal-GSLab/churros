'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/templateUpdate.json`);

suite.forElement('documents', 'custom-fields', (test) => {

  it('should support CRUS for /custom-fields/templates', () => {
    let tempKey;
    return cloud.post(`${test.api}/templates`, temPayload)
      .then(r => tempKey = r.body.templateKey)
      .then(r => cloud.put(`${test.api}/templates/${tempKey}`, updatePayload))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).get(`${test.api}/templates/${tempKey}`))
      .then(() => cloud.withOptions({ qs: { scope: "enterprise" }}).delete(`/custom-fields-templates/${tempKey}`))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).get(`${test.api}/templates`))
      .then(r => cloud.get(`${test.api}/enterprise-templates`));
  });
});
