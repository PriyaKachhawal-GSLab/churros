const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/workitems.json');
const updatePayload = require('./assets/workitems-update.json');

var uPayloadId;

suite.forElement('collaboration', 'workitems', (test) => {
  it('should allow CRUDS for workitems', () => {
      var workItemId = `1,2`;
    return cloud.get(`${test.api}/${workItemId}`)
    .then(r => cloud.withOptions({ qs: { type: `task`} }).post(`${test.api}`, payload)
    .then(r => {
        uPayloadId = r.body.id;
    })
    .then(r => cloud.patch(`${test.api}/${uPayloadId}`,updatePayload))
    .then(r => cloud.get(`${test.api}/${uPayloadId}`))
    .then(r => cloud.delete(`${test.api}/${uPayloadId}`))
);
  });
});
