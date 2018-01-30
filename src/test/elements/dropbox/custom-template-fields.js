'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);

suite.forElement('documents', 'custom-fields-templates', (test) => {
 let tempKey;
  it('should support CRUS for /custom-fields-templates/templates', () => {
    let updatePayload = {
      "add_fields": [
        {
            "name": "Security Policy",
            "description": "This is the security policy of the file or folder described.\nPolicies can be Confidential, Public or Internal.",
            "type": "string"
        }
      ]
    };
    return cloud.post(`${test.api}`, temPayload)
      .then(r => tempKey = r.body.template_id)
      .then(r => cloud.put(`${test.api}/${tempKey}`, updatePayload))
      .then(r => cloud.get(`${test.api}/${tempKey}`))
      .then(r => cloud.get(`${test.api}`))
      .then(r => cloud.delete(`${test.api}/${tempKey}`));
  });
});
