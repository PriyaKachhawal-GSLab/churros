/* MOCKING OUT THE core/oauth module here */
const mockery = require('mockery');
mockery.registerMock('core/oauth', () => 'http://snoopaloopredirecturl.com/redirecter?code=speakercity&oauth_verifier=josephbluepulaski');
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});
const provisioner = require('core/provisioner');
mockery.disable();
/****************************************/

require('core/assertions');
const chakram = require('chakram');
const expect = chakram.expect;
const nock = require('nock');
const props = require('core/props');
const defaults = require('core/defaults');
const argv = require('optimist').argv;
const auth = 'User fake, Organization fake';
const headers = () => new Object({ reqheaders: { 'Authorization': (value) => value === auth } });
const baseUrl = 'https://api.cloud-elements.com/elements/api-v2;';
// add 'polling' to command line to simulate the '--polling' flag
argv.polling = 'true';
const setupProps = () => {
  props({
    'url': 'http://google.com',
    'user': 'franky',
    'oauth.callback.url': 'http://myfakecallbackurl',
    'element': 'myelement',
    'myelement': {
      'elementId': '123',
      'username': 'frank',
      'password': 'ricard'
    },
    'badelement': {
      'elementId': '123',
      'username': 'frank',
      'password': 'ricard'
    },
    'myoauth1element': {
      'elementId': '123',
      'provisioning': 'oauth1',
      'username': 'frank',
      'password': 'ricard',
      'oauth.api.key': 'he gon do one',
      'oauth.api.secret': 'fill it up again'
    },
    'myoauth2element': {
      'elementId': '123',
      'provisioning': 'oauth2',
      'username': 'frank',
      'password': 'ricard',
      'oauth.api.key': 'he gon do one',
      'oauth.api.secret': 'fill it up again'
    },
    'myoauth2external': {
      'elementId': '123',
      'provisioning': 'oauth2',
      'external': true,
      'username': 'frank',
      'password': 'ricard',
      'oauth.api.key': 'he gon do one',
      'oauth.api.secret': 'fill it up again',
      'tokenUrl': 'http://pvenkman.ghostbuster.com/token'
    },
    'myoauth1external': {
      'elementId': '123',
      'provisioning': 'oauth1',
      'external': true,
      'username': 'frank',
      'password': 'ricard',
      'oauth.api.key': 'he gon do one',
      'oauth.api.secret': 'fill it up again',
      'tokenUrl': 'http://pvenkman.ghostbuster.com/token'
    },
    'noTokenUrl': {
      'elementId': '123',
      'provisioning': 'oauth2',
      'external': true,
      'username': 'frank',
      'password': 'ricard',
      'oauth.api.key': 'he gon do one',
      'oauth.api.secret': 'fill it up again'
    },
    'customProvisioning': {
      'elementId': '123',
      'provisioning': 'custom',
      'username': 'frank'
    },
    'myboguselement': {
      'elementId': '123',
      'provisioning': 'oauth2',
      'external': true,
      'username': 'frank',
      'password': 'ricard',
      'oauth.api.key': 'he gon do one',
      'oauth.api.secret': 'fill it up again'
    }
  });
};

describe('provisioner', () => {
  const backupThings = [{element: {key: 'noFake',id: 321}},{element: {key: 'closeio', id: 123}}, null];

  /** Before each because we run all of the unit tests at once and initializing some of these things
  in multiple before blocks breaks things. I prefer them to be self-contained as opposed to a global
  before or something like that ... */
  beforeEach(() => {
    defaults(baseUrl, 'fake', 'fake', 'churrosUnitTester');

    /** Has to be in before each with current approach: https://github.com/pgte/nock#specifying-hostname **/
    nock(baseUrl, headers())
      .post('/instances')
      .reply(200, (uri, requestBody) => {
        requestBody.id = 123;
        return requestBody;
      })
      .post('/instances', {
        name: 'churros-instance',
        element: { key: 'badelement' }
      })
      .reply(404, (uri, requestBody) => {
        return { message: 'No element found with key badelement' };
      })
      .put('/instances/4567', {
        name: 'churros-instance',
        element: { key: 'myoauth1element' }
      })
      .reply(200, (uri, requestBody) => {
        requestBody.id = 4567;
        return requestBody;
      })
      .put('/instances/45678', {
        name: 'churros-instance',
        element: { key: 'myoauth2element' }
      })
      .reply(200, (uri, requestBody) => {
        requestBody.id = 45678;
        return requestBody;
      })
      .delete('/instances/123')
      .reply(200)
      .delete('/instances/45678')
      .reply(200)
      .delete('/instances/456')
      .reply(404);

    nock(baseUrl, headers())
      .get('/elements/myoauth1element/oauth/token')
      .query(true)
      .reply(200, () => new Object({
        token: 'token',
        secret: 'secret'
      }))
      .get('/elements/myelement')
      .reply(200, () => {
        return {key: 'myelement', id: 123, configuration: [{key: 'event.poller.configuration'}, {key: 'event.metadata', defaultValue: '{"webhook": {"Account": {"eventTypes": ["created", "updated", "deleted"]}, "Lead": {"eventTypes":\n        ["created", "updated", "deleted"]}, "Contact": {"eventTypes": ["created", "updated", "deleted"]},\n        "Opportunity": {"eventTypes": ["created", "updated", "deleted"]}, "{objectName}": {"eventTypes": ["created",\n        "updated", "deleted"]}}, "polling": {"Account": {"eventTypes":\n        ["created", "updated"]}, "Lead": {"eventTypes": ["created", "updated"]}, "Contact": {"eventTypes":\n        ["created", "updated"]}, "Opportunity": {"eventTypes": ["created", "updated"]}, "{objectName}": {"eventTypes":\n        ["created", "updated", "deleted"]}}}'}]};
      })
      .get('/elements/myoauth2element')
      .reply(200, () => {
        return {key: 'myoauth2element', id: 123, configuration: [{key: 'event.poller.configuration', defaultValue: "NoConfig"}]};
      })
      .get('/elements/myoauth1element')
      .reply(200, () => {
        return {key: 'myoauth1element', id: 123, configuration: [{key: 'event.poller.configuration', defaultValue: "NoConfig"}]};
      })
      .get('/instances/4567')
      .reply(200, () => ({
          id:4567,
          name: 'churros-instance',
          element: { key: 'myoauth1element' }
      }))
      .get('/elements/123/metadata')
      .reply(200, () => {
        return {events : {supported: true, methods: ['polling', 'webhook']}};
      })
      .get('/instances?tags%5B%5D=churros-backup&hydrate=false')
      .reply(200, () => {
        backupThings.pop();
        return backupThings;//will return 3 different results
      });

    nock(baseUrl, headers())
      .get('/elements/myoauth1element/oauth/url')
      .query(true)
      .reply(200, () => new Object({
        oauthUrl: 'http://frankthetanksoauthurl.com'
      }));

    nock(baseUrl, headers())
      .get('/elements/myoauth2element/oauth/url')
      .query(true)
      .reply(200, () => new Object({
        oauthUrl: 'http://frankthetanksoauthurl.com'
      }));

    nock(baseUrl, headers())
      .get('/elements/myoauth2external/oauth/url')
      .query(true)
      .reply(200, () => new Object({
        oauthUrl: 'http://frankthetanksoauthurl.com'
      }));

    nock(baseUrl, headers())
      .get('/elements/myoauth1external/oauth/token')
      .query(true)
      .reply(200, () => new Object({
        oauthUrl: 'http://frankthetanksoauthurl.com'
      }));

    nock(baseUrl, headers())
      .get('/elements/myoauth1external/oauth/url')
      .query(true)
      .reply(200, () => new Object({
        oauthUrl: 'http://frankthetanksoauthurl.com'
      }));
    nock(baseUrl, headers())
      .get('/elements/123/oauth/url/default')
      .query(true)
      .reply(200, () => new Object({
        oauthUrl: 'http://frankthetanksoauthurl.com',
        configuration:{
          secret:'1234'
        }
      }));

    nock(baseUrl, headers())
      .get('/elements/noTokenUrl/oauth/url')
      .query(true)
      .reply(200, () => new Object({
        oauthUrl: 'http://frankthetanksoauthurl.com'
      }));

    nock('http://pvenkman.ghostbuster.com')
      .post('/token')
      .reply(200, () => new Object({
        refresh_token: 'peters refresh token'
      }));

  });

  it('should allow creating a standard element instance', () => {
    setupProps();
    return provisioner.create('myelement')
      .then(r => {
        expect(r).not.to.be.null;
        expect(r.body).not.to.be.null;
        expect(r.body.id).to.equal(123);
      });
  });

  it('should allow creating an oauth1 element instance', () => {
    setupProps();
    return provisioner.create('myoauth1element')
      .then(r => {
        expect(r).not.to.be.null;
        expect(r.body).not.to.be.null;
        expect(r.body.id).to.equal(123);
        expect(r.body.providerData).not.to.be.null;
        expect(r.body.providerData.secret).to.equal('secret');
        expect(r.body.providerData.oauth_verifier).to.equal('josephbluepulaski');
      })
      .then(r => mockery.disable());
  });

  it('should allow updating an oauth1 element instance', () => {
    setupProps();
    return provisioner.update('myoauth1element', null, null, 4567)
      .then(r => {
        expect(r).not.to.be.null;
        expect(r.body).not.to.be.null;
        expect(r.body.id).to.equal(4567);
        expect(r.body.providerData).not.to.be.null;
        expect(r.body.providerData.secret).to.equal('secret');
        expect(r.body.providerData.oauth_verifier).to.equal('josephbluepulaski');
      })
      .then(r => mockery.disable());
  });

  it('should allow creating a default oauth1 element instance', () => {
    setupProps();
    return provisioner.createWithDefault('myoauth1element')
      .then(r => {
        expect(r).not.to.be.null;
        expect(r.body).not.to.be.null;
        expect(r.body.id).to.equal(123);
        expect(r.body.providerData).not.to.be.null;
        expect(r.body.providerData.secret).to.equal('1234');
        expect(r.body.providerData.oauth_verifier).to.equal('josephbluepulaski');
      })
      .then(r => mockery.disable());
  });

  it('should allow updating a default oauth1 element instance', () => {
    setupProps();
    return provisioner.updateWithDefault('myoauth1element', null, null, 4567)
      .then(r => {
        expect(r).not.to.be.null;
        expect(r.body).not.to.be.null;
        expect(r.body.id).to.equal(4567);
        expect(r.body.providerData).not.to.be.null;
        expect(r.body.providerData.secret).to.equal('1234');
        expect(r.body.providerData.oauth_verifier).to.equal('josephbluepulaski');
      })
      .then(r => mockery.disable());
  });


  it('should throw an error if oauth1 element is missing required props', () => {
    setupProps();
    props.set('oauth.callback.url', null);
    try {
      provisioner.create('myoauth1element');
    } catch (e) {
      return true;
    }
    throw Error('Should not have gotten here!');
  });

  it('should allow creating an oauth2 element instance', () => {
    setupProps();
    return provisioner.create('myoauth2element')
      .then(r => {
        expect(r).not.to.be.null;
        expect(r.body).not.to.be.null;
        expect(r.body.id).to.equal(123);
        expect(r.body.providerData).not.to.be.null;
        expect(r.body.providerData.code).to.equal('speakercity');
      })
      .then(r => mockery.disable());
  });

    it('should allow updating an oauth2 element instance', () => {
      setupProps();
      return provisioner.update('myoauth2element', null, null, 45678)
        .then(r => {
          expect(r).not.to.be.null;
          expect(r.body).not.to.be.null;
          expect(r.body.id).to.equal(45678);
          expect(r.body.providerData).not.to.be.null;
          expect(r.body.providerData.code).to.equal('speakercity');
        })
        .then(r => mockery.disable());
    });

    it('should allow creating a default oauth2 element instance', () => {
      setupProps();
      return provisioner.createWithDefault('myoauth2element')
        .then(r => {
          expect(r).not.to.be.null;
          expect(r.body).not.to.be.null;
          expect(r.body.id).to.equal(123);
          expect(r.body.providerData).not.to.be.null;
          expect(r.body.providerData.code).to.equal('speakercity');
        })
        .then(r => mockery.disable());
    });

    it('should allow updating a default oauth2 element instance', () => {
      setupProps();
      return provisioner.updateWithDefault('myoauth2element', null, null, 45678)
        .then(r => {
          expect(r).not.to.be.null;
          expect(r.body).not.to.be.null;
          expect(r.body.id).to.equal(45678);
          expect(r.body.providerData).not.to.be.null;
          expect(r.body.providerData.code).to.equal('speakercity');
        })
        .then(r => mockery.disable());
    });

  it('should allow creating an oauth2 element instance with debug', () => {
    setupProps();
    return provisioner.create('myoauth2element', {debug : true})
      .then(r => {
        expect(r).not.to.be.null;
        expect(r.body).not.to.be.null;
        expect(r.body.id).to.equal(123);
        expect(r.body.providerData).not.to.be.null;
        expect(r.body.providerData.code).to.equal('speakercity');
        expect(r.body.providerData.debug).to.equal(true);
      })
      .then(r => mockery.disable());
  });


  it('should allow creating an oauth2 external instance', () => {
    setupProps();
    return provisioner.create('myoauth2external')
      .then(r => {
        expect(r).not.to.be.null;
        expect(r.body).not.to.be.null;
        expect(r.body.id).to.equal(123);
        expect(r.body.configuration).to.not.be.null;
        expect(r.body.configuration['oauth.api.key']).to.equal('he gon do one');
        expect(r.body.configuration['oauth.api.secret']).to.equal('fill it up again');
        expect(r.body.configuration['oauth.user.refresh_token']).to.equal('peters refresh token');
      })
      .then(r => mockery.disable());
  });

  it('should allow partially provisioning an oauth2 element instance', () => {
    setupProps();
    return provisioner.partialOauth('myoauth2element')
      .then(r => {
        expect(r).to.exist;
        expect(r).to.equal('speakercity');
      })
      .then(r => mockery.disable());
  });

  it('should throw an error for provisioning an oauth1 element with external', () => {
    setupProps();
    return provisioner.create('myoauth1external')
      .catch(e => {
        expect(e).to.not.be.null;
        expect(e.message).to.equal('External Authentication via churros is not yet implemented for OAuth1');
      });
  });

  it('should throw an error for provisioning an oauth2 element with no token url', () => {
    setupProps();
    return provisioner.create('noTokenUrl')
      .catch(e => {
        expect(e).to.not.be.null;
        expect(e.message).to.equal(`Token URL must be present in the element props as 'tokenUrl'`);
      });
  });

  it('should throw an error if provisioning a bogus element', () => {
    setupProps();
    return provisioner.create('myboguselement')
      .catch(e => {
        expect(e).to.not.be.null;
      });
  });

  it('should throw an error if creating an element instance does not return a 200', () => {
    setupProps();
    return provisioner.create('badelement')
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => true);
  });

  it('should allow deleting an element instance', () => {
    setupProps();
    return provisioner.delete(123);
  });

  it('should throw an error if deleting an element instance does not return a 200', () => {
    setupProps();
    return provisioner.delete(456)
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => true);
  });

  it('should allow creating an element instance with custom provisioning', () => {
    setupProps();
    const mockProvisioner = {
      create: (config) => new Promise((res, rej) => res({ body: { token: 123 } }))
    };
    const s = `${__dirname}`.split('/');
    const root = s.filter((i) => i !== 'test' && i !== 'core').reduce((fullPath, item) => fullPath + '/' + item);
    const reqPath = `${root}/src/core/../test/elements/customProvisioning/provisioner`;
    mockery.registerMock(reqPath, mockProvisioner);
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    return provisioner.create('customProvisioning')
      .then(r => {
        mockery.disable();
      });
  });

  it('should use a backup', () => {
    return provisioner.getBackup('closeio')
    .then((r) => expect(r.body).to.deep.equal({ element: { key: 'closeio', id: 123 } }));
  });
  it('should not find a backup', () => {
    return provisioner.getBackup('fake')
    .then((r) => expect(r).to.be.empty);
  });
  it('should fail backup on empty response', () => {
    return provisioner.getBackup('fake')
    .then((r) => expect(r).to.be.empty);
  });
});
