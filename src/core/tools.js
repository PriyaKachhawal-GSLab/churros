/**
 * A handful of utility functions that are used throughout lots of our test suites.
 * @module core/tools
 */
'use strict';

const logger = require('winston');
const sleep = require('sleep');
const fs = require('fs');
const faker = require('faker');
const R = require('ramda');

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
    if (!possible || typeof(possible) !== "string") {
      if (typeof(possible) === "number"){
        len = possible;
      }
      possible = "abcdefghijklmnopqrstuvwxyz";
    }
    if (!len || typeof(len) !== "number") {
      len = 8;
    }
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

const waitUntil = (max, interval) => pred => new Promise((res, rej) => {
  const doit = (ms) => {
    return pred()
      .then(r => res(r))
      .then(r => res(r))
      .catch(e => {
        if (ms - interval < 0) {
          return rej(e || `Predicate was not true within the maximum time allowed of ${max} ms.`);
        }
        setTimeout(doit, interval, ms - interval); });
  };
  setTimeout(doit, interval, max - interval);
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
  /** TODO docs
  */
  until: (max, interval) => ({
    for: waitUntil(max, interval)
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

/**
* Gets the integer limit from a CEQL statement
* @param {object} obj CEQL object like `{qs: q:'select * from contacts limit 100 where id = 12'}
**/
exports.getLimit = (obj) => {
  let limit = obj ? obj.qs ? obj.qs.q ? obj.qs.q.includes('limit ') ? obj.qs.q.substring(obj.qs.q.indexOf('limit ') + 6) : '' : '' : '' : '';
  if (limit && limit.includes('where')) {
    limit = limit.substring(0, limit.indexOf('where'));
  }

  if (!R.isEmpty(limit) && !R.isEmpty(limit.trim()) && !isNaN(limit.trim())) {
    return parseInt(limit.trim());
  }

  return -1;
};

/**
* Gets an array from a JSON-L string
* @param {string} body
**/
const getJsonL = exports.getJsonL = body => (
  body.split('\n').map(obj => {
    try {
      return JSON.parse(obj);
    } catch (e) { return ''; }
  })
);

/**
 * Checks whether we are able to split an object by newline characters
 * @param {object} obj
 **/
const isJsonL = exports.isJsonL = obj => {
  try {
    return obj.split('\n').length > 1;
  } catch (e) {
    return false;
  }
};

/**
* Get JSON body from an object, with handling for converting JSON-L, parsing JSON and detecting native objects.
* @param {Object} obj
**/
exports.getJson = obj => {
  if (typeof(obj) === 'string') {
    return isJsonL(obj) ? getJsonL(obj) : JSON.parse(obj);
  } else if (obj === Object(obj)) {
    return obj;
  } else {
    return null;
  }
};

/**
* Gets an array of transformations fields for a particular element object
* @param {array} fields ['id', 'createdDate']
**/
exports.getFieldsFromTransformation = (element, objectName) => {
  const transformationsFile = `${__dirname}/../test/elements/${element}/assets/transformations.json`;
  // is there is a transformation file here
  if (fs.existsSync(transformationsFile)) {
    const transformations = require(transformationsFile);
    if (transformations[objectName] && transformations[objectName].fields) {
      return transformations[objectName].fields.map(o => o.path);
    }
  }

  return null;
};

/**
* Gets reduced response for particular fields
* @param {array} arrayResponse [{ "key": "value"}, { "key", "value"}]
* @param {array} fields ['id', 'createdDate']
**/
exports.getFieldsMap = (arrayResponse, fields) => (
  arrayResponse
  .filter(obj => !(R.isEmpty(obj) || R.isNil(obj)))
  .map(obj => (
    Object.keys(obj)
    .filter(k => fields.includes(k)).sort()
    .reduce((acc, k) => {
      acc[k] = obj[k];
      return acc;
    }, {})
  ))
);

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

  faker.random.letter = () => exports.randomStr('abcdefghijklmnopqrstuvwxyz', 1);
  faker.random.letterUppercase = () => exports.randomStr('abcdefghijklmnopqrstuvwxyz', 1).toUpperCase();
  faker.random.singleNumber = () => Math.floor(Math.random() * 10);
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
    datas = JSON.parse(require('core/cleanup.json'));
  } catch (e) {
    datas = require(`${__dirname}/cleanup.json`);
  }
  datas.push(obj);
  return fs.writeFile(`${__dirname}/cleanup.json`, JSON.stringify(datas));
};
exports.getCleanup = () => require(`${__dirname}/cleanup.json`);
exports.resetCleanup = () => fs.writeFileSync(`${__dirname}/cleanup.json`, '[]');
exports.findInArray = (items, field, value) => R.find(R.propEq(field, value))(items);
