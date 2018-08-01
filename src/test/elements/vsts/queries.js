const suite = require('core/suite');
const cloud = require('core/cloud');
const queryUpdatePayload = require('./assets/queryUpdatePayload.json');
const payload = require('./assets/queryPayload.json');
var queryID = ``;
suite.forElement('collaboration', 'queries', (test) => {
  it('should allow CRUDS for queries', () => {
    return cloud.get(`${test.api}`).
    then(r => cloud.post(test.api, payload.value)).
    then(r => {
        queryID = r.body.id;
      })
      .then(r => cloud.get(`${test.api}/${queryID}`)).
    then(r => cloud.patch(`${test.api}/${queryID}`, queryUpdatePayload)).
    then(r => cloud.delete(`${test.api}/${queryID}`));
  });
});