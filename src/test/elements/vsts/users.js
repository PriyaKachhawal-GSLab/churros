const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('collaboration', 'users', (test) => {
  it('should allow R for users', () => {
    return cloud.get(test.api);
  });
});
