'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);
const updateTemPayload = tools.requirePayload(`${__dirname}/assets/UpdateTemplate.json`);

suite.forElement('documents', 'custom-fields-templates', (test) => {
  it('should support CRUS for /custom-fields-templates/templates', () => {
    let tempKey;
    return cloud.post(`${test.api}`, temPayload)
      .then(r => tempKey = r.body.template_id)
      .then(r => cloud.put(`${test.api}/${tempKey}`, updateTemPayload))
      .then(r => cloud.get(`${test.api}/${tempKey}`))
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.delete(`${test.api}/${tempKey}`));
  });
});
