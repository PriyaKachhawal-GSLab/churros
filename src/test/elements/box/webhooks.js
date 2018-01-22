'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const props = require('core/props');
const faker = require('faker');
const chakram = require('chakram');
const webhookTemplate = (fileId) => ({ "target": { "id": fileId, "type": "file" }, "triggers": ["METADATA_INSTANCE.CREATED", "METADATA_INSTANCE.UPDATED", "METADATA_INSTANCE.DELETED"] });
// Box doesn't allow localhost callback
const getWebhookPayload = (fileId, url) => url && url.includes('localhost') ? Object.assign({}, webhookTemplate(fileId), { address: props.getOptional('event.callback.url') }) : webhookTemplate(fileId);

suite.forElement('documents', 'webhooks', (test) => {
  let fileId, path = `${__dirname}/../assets/brady.jpg`;
  let query = { path: `/brady-${faker.random.number()}.jpg` };

  before(() => cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
    .then(r => fileId = r.body.id)
  );
  it('should support CRUDS for webhooks', () => {
    return cloud.cruds(test.api, getWebhookPayload(fileId, props.getOptional('url')), null, chakram.put);
  });
  after(() => cloud.delete(`/hubs/documents/files/${fileId}`));
});
