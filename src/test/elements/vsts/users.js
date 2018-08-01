const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('collaboration', 'users', (test) => {
  it('should allow S for users', () => {
    return cloud.get(test.api);
  });
});
