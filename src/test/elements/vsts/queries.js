const suite = require('core/suite');
const cloud = require('core/cloud');
const queryPayload = require('./assets/queryPayload.json');
var ref='';
const payload = queryPayload.payload;
const path = queryPayload.path;
const updatePayload = queryPayload.updatePayload;
const pId = queryPayload.id;

suite.forElement('collaboration', 'queries', (test) => {
  it('should allow CRUDS for queries', () => {
    return cloud.get(`${test.api}`)
    .then(r => cloud.get(`${test.api}/${pId}`))
    .then(r => cloud.withOptions({ qs: { query: path } }).post(`${test.api}`, payload))
     .then(r => {
       ref = r.body.id;
    })
      .then(r => cloud.patch(`${test.api}/${ref}`, updatePayload))
      .then(r => cloud.delete(`${test.api}/${ref}`));
});
});
