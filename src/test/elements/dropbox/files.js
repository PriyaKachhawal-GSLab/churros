'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const tools = require('core/tools');
const payload=tools.requirePayload(`${__dirname}/assets/customFields.json`);
const updatePayload=tools.requirePayload(`${__dirname}/assets/UpdateCustomFields.json`);
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);

suite.forElement('documents','files',(test) => {

  let jpgFile = __dirname + '/assets/brady.jpg';
  let tempKey;
  let customBody;
  var jpgFileBody,revisionId;
  let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };

  before(() => cloud.withOptions({ qs : query }).postFile(test.api, jpgFile)
  .then(r => jpgFileBody = r.body)
  .then(r => cloud.post('/hubs/documents/custom-fields-templates', temPayload))
      .then(r => {
        customBody= r.body;
        tempKey = r.body.template_id;
        updatePayload.add_or_update_fields[0].name = temPayload.fields[0].name;
        payload.fields[0].name = temPayload.fields[0].name;
      }));

  after(() => cloud.delete(`${test.api}/${jpgFileBody.id}`)
  .then(r => cloud.delete(`/hubs/documents/custom-fields-templates/${tempKey}`))
);

  it('it should allow RS for documents/files/:id/revisions', () => {
      return cloud.get(`${test.api}/${jpgFileBody.id}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.get(`${test.api}/${jpgFileBody.id}/revisions/${revisionId}`));
  });

  it('it should allow RS for documents/files/revisions by path', () => {
      return cloud.withOptions({ qs: query }).get(`${test.api}/revisions`)
      .then(r => revisionId = r.body[0].id)
      .then(() => cloud.withOptions({ qs: query }).get(`${test.api}/revisions/${revisionId}`));
  });

  it(' it should allow RS for /files/{id}/custom-fields-templates/{templateKeyId}/custom-fields', () => {
    return cloud.post(`/files/${jpgFileBody.id}/custom-fields-templates/${tempKey}/custom-fields`, payload)
        .then(r => cloud.put(`/hubs/documents/files/${jpgFileBody.id}/custom-fields-templates/${tempKey}/custom-fields`, updatePayload))
        .then(r => cloud.delete(`/hubs/documents/files/${jpgFileBody.id}/custom-fields-templates/${tempKey}/custom-fields`));
  });


});
