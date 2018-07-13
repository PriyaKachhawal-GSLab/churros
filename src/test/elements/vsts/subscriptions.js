const suite = require('core/suite');
const cloud = require('core/cloud');
const subscriptionPayload = require('./assets/subscriptions.json');

var subId = subscriptionPayload.SampleId;
var CPayload = subscriptionPayload.payload;
var uPayloadId='';
const  updatePayload = subscriptionPayload.updatePayload;

suite.forElement('collaboration', 'subscriptions', (test) => {
  it('should allow CRUDS for subscriptions & R for subscriptions/templates', () => {
    return cloud.get(test.api)
    .then(r => cloud.get(`${test.api}/templates`))
    .then(r => cloud.get(`${test.api}/${subId}`))
    .then(r => cloud.post(`${test.api}`, CPayload))
    .then(r => {
        uPayloadId= r.body.id;
    })
    .then(r => cloud.patch(`${test.api}/${uPayloadId}`,updatePayload))
    .then(r => cloud.delete(`${test.api}/${uPayloadId}`));
  });
});
