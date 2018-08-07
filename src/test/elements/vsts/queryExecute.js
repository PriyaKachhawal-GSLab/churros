const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/queries-child-create.json');

suite.forElement('collaboration', 'queriesExecute', (test) => {
  it('should support queries/{queryId}/execute for flat queries', () => {
    let queryId;
    return cloud.post('queries', payload)
    // Creating a new query
        .then(r => queryId = r.body.id)
    // Executing query using created query Id    
        .then(r => cloud.get(`queries/${queryId}/execute`))
    // Deleting the query created
        .then(r => cloud.delete(`queries/${queryId}`));
  });
});
