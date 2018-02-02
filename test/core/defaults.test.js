require('core/assertions');
const defaults = require('core/defaults');
const expect = require('chai').expect;

describe('chakram defaults', () => {
  it('should support initializing our chakram defaults', () => {
    defaults('url', 'user', 'org', 'unitTester');
    const {userSecret, orgSecret} = defaults.secrets();
    expect(userSecret).to.equal('user');
    expect(orgSecret).to.equal('org');
  });

  it('should support resetting our chakram defaults after they have been initialized', () => {
    defaults('url', 'user', 'org', 'unitTester');
    defaults.reset();
  });

  it('should support adding a token to our chakram defaults after they have been initialized', () => {
    defaults('url', 'user', 'org', 'unitTester');
    defaults.token('token');
  });

  it('should support changing chakram defaults after they have been initialized', () => {
    defaults('url', 'user', 'org', 'unitTester');
    defaults.withDefaults('user', 'org', 'unitTester');
  });


  it('should throw error if setting chakram defaults improperly', () => {
    try {
      defaults();
    } catch (e) {
      return true;
    }
    throw Error('Fail...');
  });
});
