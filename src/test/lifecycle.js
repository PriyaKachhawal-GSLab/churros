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
  const secUrl = url + '/elements/j_spring_security_check';
  const options = { jar: true, form: { j_username: props.get('user'), j_password: props.get('password') } };

  /**
   * Sets up our publicly available HTTP listener and whatever URL we're given, we set that
   * in our events:url property to be used as our webhook callback URL elsewhere
   * @return {Promise} A promise that, when resolved, contains the tunnel that was started
   */
  const setupEventsTunnel = () => {
    const url = props.getOptionalForKey('events', 'url');
    if (url) {
      logger.debug("Using events URL %s", url);
      return Promise.resolve(url);
    }
    const port = props.getForKey('events', 'port');
    return tunnel.start(port)
      .then(url => props.setForKey('events', 'url', url));
  };

  /**
   * Sets up our HTTP server listener
   * @return {Promise} A promise that, when resolved, contains the server that was started
   */
  const setupServer = () => server.start(props.getForKey('events', 'port'));

  return chakram.post(secUrl, null, options)
    .then(r => {
      expect(r).to.have.statusCode(200);
      return chakram.get(`${url}/elements/api-v1/ui/getSecrets`, { jar: true });
    })
    .then(r => {
      expect(r).to.have.statusCode(200);
      defaults(`${url}/elements/api-v2`, r.body.user, r.body.company, props.get('user'));
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
