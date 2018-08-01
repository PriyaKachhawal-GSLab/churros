const suite = require('core/suite');
const cloud = require('core/cloud');
const query = require('./assets/wiql.json');

// This is a hidden API, but is worthwhile for flexible Work Item query testing
suite.forElement('collaboration', 'wiql', (test) => {
  it('should allow C for /wiql', () => {
    return cloud.post(test.api, query);
  });
});
