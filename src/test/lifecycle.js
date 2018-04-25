'use strict';

require('core/assertions');
const chakram = require('chakram');
const expect = chakram.expect;
const argv = require('optimist').argv;
const defaults = require('core/defaults');
const tunnel = require('core/tunnel');
const server = require('core/server');
const logger = require('core/logger')(argv.verbose ? 'silly' : 'info');

let config;
try {
	config = require((process.env.HOME || process.env.USERPROFILE) + '/.churros/sauce.json');
} catch (e) {
  console.log('No properties found.  Make sure to run \'churros init\' first.');
  process.exit(1);
}

config.user = (argv.user || config.user);
config.password = (argv.password || config.password);
config.url = (argv.url || config.url);
config.browser = (argv.browser || 'firefox'); // long term, want to change this to phantom...this is helpful for debugging now in the early stages of churros

// this happens once
const props = require('core/props')(config);
if (argv.externalAuth) {
  const element = argv.element;
  props.setForKey(element, 'external', true);
}

if (!config.events) config.events = {};
config.events.wait = (argv.wait || config.events.wait);
config.events.load = (argv.load || config.events.load);
config.events.element = (argv.loadElement || config.events.element);


before(() => {
  const url = props.get('url');

  /**
   * Sets up our publicly available HTTP listener and whatever URL we're given, we set that
   * in our events:url property to be used as our webhook callback URL elsewhere
   * @return {Promise} A promise that, when resolved, contains the tunnel that was started
   */
  const setupEventsTunnel = () => {
    const eventsUrl = props.getOptionalForKey('events', 'url');
    if (eventsUrl) {
      logger.debug("Using events URL %s", eventsUrl);
      return Promise.resolve(eventsUrl);
    }
    const port = props.getForKey('events', 'port');
    return tunnel.start(port)
      .then(tmpUrl => props.setForKey('events', 'url', tmpUrl));
  };

  /**
   * Sets up our HTTP server listener
   * @return {Promise} A promise that, when resolved, contains the server that was started
   */
  const setupServer = () => server.start(props.getForKey('events', 'port'));

  const payload = { username: props.get('user'), password: props.get('password') };
  return chakram.post(`${url}/elements/api-v2/authentication`, payload)
    .then(r => {
      expect(r).to.have.statusCode(200);
      // swap the bearer token for user/org secrets to use on all subsequent API calls
      const options = {headers: {Authorization: `Bearer ${r.response.body.token}`}};
      return chakram.get(`${url}/elements/api-v2/authentication/secrets`, options);
    })
    .then(r => {
      expect(r).to.have.statusCode(200);
      defaults(`${url}/elements/api-v2`, r.response.body.userSecret, r.response.body.organizationSecret, props.get('user'));
    })
    .then(r => setupEventsTunnel())
    .then(r => setupServer())
    .catch(r => {
      // if the lifecycle fails, then we want to exit with an error and not let anything else continue
      logger.error('Well shucks...failed to finish initialization...\n  Is %s up and running?\n  Do you have the right username and password?\n', url);
      logger.error(r);
      process.exit(1);
    });
});
