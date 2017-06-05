/**
 * A handful of utility functions that are used throughout lots of our test suites.
 * @module core/tools
 */
'use strict';

const logger = require('winston');
const sleep = require('sleep');
const fs = require('fs');
const faker = require('faker');

var exports = module.exports = {};

/**
 * Generates a random string
 * @return {string} A random, 7 character string
 */
exports.random = () => Math.random().toString(36).substring(7);

/**
 * Generates a random string from possible and can determine length
 * @return {string} A random, 7 character string
 */
exports.randomStr = (possible, len) => {
    let text = "";

    for( let i=0; i < len; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
    return text;
};

/**
 * Generates a random email address in the @churros.com domain
 * @return {string} A random, 7-character email address
 */
exports.randomEmail = () => {
  const address = exports.random();
  const domain = 'churros';
  return address + '@' + domain + '.com';
};

/**
 * Generates a random integer
 * @return {int} A random integer
 */
exports.randomInt = () => Math.floor(Math.random() * (1000 - 1 + 1)) + 1;

/**
 * Log and throw an error
 * @param  {String} msg   The message to log
 * @param  {Error} error  The JS error to throw
 * @param  {Object} arg   Any args to pass when logging
 */
exports.logAndThrow = (msg, error, arg) => {
  arg ? logger.error(msg, arg) : logger.error(msg);
  throw error;
};

/**
 * Base 64 encode a string
 * @param {string} s The string to base 64 encode
 */
exports.base64Encode = s => new Buffer(s).toString('base64');
/**
 * Base 64 decode the given string
 * @param {string} s      The string to decode
 * @param {string} base64 The base 64 decoded string
 */
exports.base64Decode = s => new Buffer(s, 'base64').toString('ascii');

/**
 * Sleep for a certain amount of time
 * @param {int} secs The number of seconds to sleep
 */
exports.sleep = secs => {
  logger.debug(`Sleeping for ${secs} seconds`);
  sleep.sleep(secs);
};

const waitFor = max => pred => new Promise((res, rej) => {
  const doit = (ms) => {
    return pred()
      .then(r => res(r))
      .then(r => res(r))
      .catch(e => {
        if (ms - 3000 < 0) {
          return rej(e || `Predicate was not true within the maximum time allowed of ${max} ms.`);
        }
        setTimeout(doit, 3000, ms - 3000); });
  };
  doit(max);
});

/**
 * Wait for up to a maximum number of milliseconds for a Promise to resolve.
 * @memberof module:core/tools
 * @namespace wait
 */
exports.wait = {
  /**
   * Waits up to a `max` number of seconds for a Promise to resolve
   * @param {number} max The max number of seconds to wait
   * @namespace upTo
   * @memberof module:core/tools.wait
   */
  upTo: max => ({
    /**
     * Waits up to `max` seconds for a Promise to resolve
     * @memberof module:core/tools.wait.upTo
     */
    for: waitFor(max)
  }),
  /**
   * Waits up to 15 seconds for a Promise to resolve
   * @memberof module:core/tools.wait
   */
  for: waitFor(15000)
};


/**
 * Stringify an object
 * @param  {object} json The JSON object to stringify
 * @return {string}      The JSON object stringified
 */
exports.stringify = (json) => JSON.stringify(json);

/**
 * Copy an asset
 * @param asset The absolute path to the asset (can use `require.resolve(relativePath)`)
 */
exports.copyAsset = (asset) => JSON.parse(JSON.stringify(require(asset)));

/**
 * Run the provided function x number of times. The current index will be sent to the function
 * as it runs through each iteration. Return values are returned in an Array.
 **/
const times = x => f =>
  Array(x).fill().reduce((accum, curr, index)=> {
    accum.push(f(index));
    return accum;
  }, []);

exports.times = times;

/**
* Run a selenium file
* @param {string} element The element we are running selenium on
* @param {string} filePath The path to the selenium file
* @param {string} method Method in the selenium file
**/
exports.runFile = (element, filePath, method) => {
  return fs.existsSync(filePath) ? require(filePath)(element, method) : Promise.resolve(null);
};

/**
* @param {string} str The element we are running tests(use '--' in the element to provision with different creds)
**/
exports.getBaseElement = (str) => {
  return str.includes('--') ? str.substring(0, str.indexOf('--')) : str;
};

/**
* @param {object} obj Converts an object like `{qs: q:'select * from contacts where id = 12'}` to `{qs: where:'id = 12'}`
**/
exports.updateMetadata = (obj) => {
  const whereExp = obj ? obj.qs ? obj.qs.q ? obj.qs.q.includes('where') ? obj.qs.q.substring(obj.qs.q.indexOf('where') + 6) : '' : '' : '' : '';
  if (obj) {
    if (obj.qs) obj.qs.where = whereExp;
  }
  return obj;
};

exports.csvParse = (str) => {
  let uploadArr = str.split('\n').map(line => line.split(','));
  let firstLine = uploadArr.splice(0, 1)[0];
  return uploadArr.slice(0, -1).map(line => {
    var obj = {};
    firstLine.forEach((key, j) => {
      obj[key] = line[j];
    });
    return obj;
  });
};

exports.createExpression = (obj) => {
  let where = '';
  Object.keys(obj).forEach(key => {
    if (where.length > 0) {
      where += ' AND ';
    }
    where += typeof obj[key] === 'string' ? `${key} = '${obj[key]}'` : `${key} = ${obj[key]}`;
  });
  return where;
};
const getKey = (obj, key, acc) => {
  acc = acc ? acc : [];
  if (typeof obj === 'object') {
    let objKeys = Object.keys(obj);
    if (objKeys.includes(key)) {
      acc.push(obj[key]);
      return acc;
    }
    objKeys.forEach(k => getKey(obj[k], key, acc));
    return acc;
  }
  return acc;
};
exports.getKey = (obj, key) => getKey(obj, key);

const fake = (str, startDelim, endDelim) => {
  startDelim = startDelim ? startDelim : '<<';
  endDelim = endDelim ? endDelim : '>>';

  // find first matching << and >>
  const start = str.search(startDelim);
  const end = str.search(endDelim);

  // if no << and >> is found, we are done
  if (start === -1 && end === -1) {
    return str;
  }

  const token = str.substr(start + 2,  end - start - 2);
  const method = token.replace(endDelim, '').replace(startDelim, '');
  //allows you say specify how many words or numbers or whatnot
  let result = '';
  if (method.includes('##')) {
    let num = parseInt(method.substr(method.indexOf('##') + 2));
    const moddedMethod = method.substr(0, method.indexOf('##'));
    result = Array(num).fill(0).map((x, i) => faker.fake(`{{${moddedMethod}}}`)).join('');
  } else {
    result = faker.fake(`{{${method}}}`);
  }

  str = str.replace(startDelim + token + endDelim, result);

  // return the response recursively until we are done finding all tags
  return fake(str, startDelim, endDelim);
};

/**
* look at https://github.com/marak/Faker.js/ for complete list
* @param {Object} obj Object to randomize like '<<name.firstName>>'
**/
exports.fake = (obj) => fake(JSON.stringify(obj));

/**
* interpolates with random data use random data like '<<name.firstName>>'
* look at https://github.com/marak/Faker.js/ for complete list
* You need to have the .json on the end and use __dirname to make sure there is no problems finding the file
* @param {string} path Path to file. Use `${__dirname}/assets/fileName.json`
*/
exports.requirePayload = (path) => {
  if (fs.existsSync(path)) {
    const str = JSON.stringify(require(path));
    const payload = fake(str);
    return JSON.parse(payload);
  } else {
    throw new Error('Path is not valid:' + path);
  }
};

exports.addCleanUp = (obj) => {
  if (!obj.hasOwnProperty('url') || !obj.hasOwnProperty('method') || !obj.hasOwnProperty('secrets')) throw new Error();
  let datas;
  try {
    datas = JSON.parse(require('core/assets/cleanup'));
  } catch (e) {
    datas = require('core/assets/cleanup');
  }
  datas.push(obj);
  return fs.writeFile('src/core/assets/cleanup.json', JSON.stringify(datas));
};
exports.getCleanup = () => require('core/assets/cleanup');
exports.resetCleanup = () => fs.writeFileSync('src/core/assets/cleanup.json', '[]');
