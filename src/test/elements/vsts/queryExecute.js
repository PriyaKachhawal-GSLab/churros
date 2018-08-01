const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/queryPayload.json');
let queryId = payload.id
suite.forElement('collaboration', 'queries', (test) => {
  it('should support queries/{queryId}/execute for flat queries', () => {
    return cloud.get(`queries/${queryId}/execute`)
  });
});
