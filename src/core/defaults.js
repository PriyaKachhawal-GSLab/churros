/** @module core/defaults */
'use strict';

const chakram = require('chakram');
const logger = require('winston');

let baseUrl = null;
let userSecret = null;
let orgSecret = null;
let elementToken = null;
let username = null;

const setDefaults = (b, u, o, un) => {
  logger.debug('Modifying the chakram default request headers and base url');
  chakram.setRequestDefaults({
    baseUrl: b,
    headers: {
      Authorization: `User ${u}, Organization ${o}`,
      'User-Agent': `Churrosbot/${un}`
    }
  });
};

const validate = (b, u, o, un) => {
  if (!b) throw Error('The base URL was never set. Cannot reset until properly initialized');
  if (!u) throw Error('The user secret was never set. Cannot reset until properly initialized');
  if (!o) throw Error('The org secret was never set. Cannot reset until properly initialized');
  if (!un) throw Error('The username was never set. Cannot reset until properly initialized');
};

/**
 * Set the default chakram HTTP properties for all subsequent requests that get made through chakram
 * @param b The base URL
 * @param u The default user secret
 * @param o The default org secret
 * @param un The username
 */
var exports = module.exports = (b, u, o, un) => {
  validate(b, u, o, un);
  baseUrl = b;
  userSecret = u;
  orgSecret = o;
  username = un;
  setDefaults(b, u, o, un);
};

/**
 * Resets the defaults and removes the element token from any subsequent HTTP requests
 */
exports.reset = () => {
  validate(baseUrl, userSecret, orgSecret, username);
  setDefaults(baseUrl, userSecret, orgSecret, username);
};

/**
 * Adds the specified element token to any subsequent HTTP requests made through chakram
 * @param {string} token The element token to include on any subsequent HTTP calls
 */
exports.token = (token) => {
  elementToken = token;
  logger.debug('Adding token to our default request headers');
  chakram.setRequestDefaults({
    baseUrl: baseUrl,
    headers: {
      Authorization: `User ${userSecret}, Organization ${orgSecret}, Element ${token}`,
      'User-Agent': `Churrosbot/${username}`
    }
  });
};

exports.getToken = () => elementToken;

exports.getBaseUrl = () => baseUrl;

exports.secrets = () => ({userSecret, orgSecret});

exports.withDefaults = (u, o, un) => {
  validate(baseUrl, u, o, un);
  setDefaults(baseUrl, u, o, un);
};
