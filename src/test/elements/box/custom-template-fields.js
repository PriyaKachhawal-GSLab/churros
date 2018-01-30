'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);

suite.forElement('documents', 'custom-fields-templates',{ skip: true }, (test) => {

  it('should support CRUS for /custom-fields-templates/templates', () => {
    let tempKey;
    let updatePayload = {
      "op": "addField",
      "data": {
        "displayName": "Category",
        "key": "category",
        "hidden": false,
        "type": "string"
      },
      "scope": "enterprise"
    };
    return cloud.post(`${test.api}`, temPayload)
      .then(r => tempKey = r.body.templateKey)
      .then(r => cloud.put(`${test.api}/${tempKey}`, updatePayload))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).get(`${test.api}/${tempKey}`))
      .then(r => cloud.withOptions({ qs: { scope: "enterprise" } }).get(`${test.api}`))
      .then(r => cloud.get(`${test.api}/enterprise-templates`));
  });
});
