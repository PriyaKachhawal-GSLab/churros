const suite = require('core/suite');
const cloud = require('core/cloud');
var typeName = ``;
suite.forElement('collaboration', 'work-items-types', (test) => {
  it('should allow RS for /work-items-types', () => {
    return cloud.get(test.api).
    then( r => {
      typeName = r.body[0].referenceName;
    }). then( r => cloud.get(`${test.api}/${typeName}`))
  });
});
