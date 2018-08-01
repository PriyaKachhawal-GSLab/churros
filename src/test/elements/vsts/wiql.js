const suite = require('core/suite');
const cloud = require('core/cloud');
var query = {
    "query" : "select [System.Id] from workItems where System.Id = 30"
};
suite.forElement('collaboration', 'wiql', (test) => {
  it('should allow C for /wiql', () => {
    return cloud.post(test.api, query);
  });
});
