const suite = require('core/suite');
const cloud = require('core/cloud');

var typeName = `Epic`;
suite.forElement('collaboration', 'workitem/types', (test) => {
  it('should allow R for /workitem/types', () => {
    return cloud.get(test.api); 
  });
});
