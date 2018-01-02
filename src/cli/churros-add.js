'use strict';

const commander = require('commander');
const fs = require('fs');
const inquirer = require('inquirer');
const replaceStream = require('replacestream');
const tools = require('core/tools');
const prompter = require('./assets/prompter');

const terminate = (msg, args) => {
  args ? console.error(msg, args) : console.error(msg);
  process.exit(1);
};

const buildRootPlatformDir = () => __dirname + '/../test/platform';

const buildRootElementDir = () => __dirname + '/../test/elements';

const validateValue = (value) => value ? true : 'Must enter a value';

const buildChoiceQuestion = (name, type, message, choices, filter) => {
  const q = prompter.buildQuestion(name, type, message);
  q.choices = choices;
  q.filter = filter;
  return q;
};

const buildPlatformQuestions = () =>
  new Promise((res, rej) => {
    res([prompter.buildQuestion('name', 'input', 'Platform resource name:', (value) => validateValue(value))]);
  });

const buildElementQuestions = () =>
  new Promise((res, rej) => {
    res([
      prompter.buildQuestion('name', 'input', 'Element name:', (value) => validateValue(value)),
      prompter.buildQuestion('hub', 'input', 'Hub name:', (value) => validateValue(value)),
      buildChoiceQuestion('auth', 'list', 'Auth type:', ['standard', 'oauth1', 'oauth2'], (value) => value.toLowerCase())
    ]);
  });

const buildResourceQuestions = () => [
  prompter.buildQuestion('name', 'input', 'Resource name (CE name):', (value) => validateValue(value)),
  prompter.buildQuestion('vendorName', 'input', 'Vendor resource name:', (value) => validateValue(value)),
  prompter.buildQuestion('vendorId', 'input', 'Vendor ID field:', (value) => validateValue(value)),
  prompter.buildQuestion('more', 'confirm', 'Add more resources:')
];

const askResourceQuestions = (r, resources) => {
  resources = resources || [];
  return new Promise((res, rej) => {
    inquirer.prompt(buildResourceQuestions(), (answers) => {
      resources.push(answers);
      if (answers.more) askResourceQuestions(r, resources).then(resource => res(resource));
      else {
        r.resources = resources;
        res(r);
      }
    });
  });
};

const buildConfigQuestions = (auth, currentProps, firstTime) => {
  const qs = [];
  // these props are ALWAYS required for OAuth2 and OAuth1 elements
  if (firstTime && (auth === 'oauth1' || auth === 'oauth2')) {
    qs.push(prompter.buildQuestion('oauth.api.key', 'input', 'OAuth API Key:', (value) => validateValue(value)));
    qs.push(prompter.buildQuestion('oauth.api.secret', 'input', 'OAuth API Secret:', (value) => validateValue(value)));
    qs.push(prompter.buildQuestion('username', 'input', 'Username:', (value) => validateValue(value)));
    qs.push(prompter.buildQuestion('password', 'input', 'Password:', (value) => validateValue(value)));
    qs.push(prompter.buildQuestion('oauth.scope', 'input', 'OAuth Scope (optional):'));
    qs.push(prompter.buildQuestion('site.address', 'input', 'Subdomain (optional):'));
    qs.push(prompter.buildQuestion('more', 'confirm', 'Add more configs:'));
  } else if (firstTime) {
    qs.push(prompter.buildQuestion('more', 'confirm', 'Add configs:'));
  }

  if (!firstTime) {
    // using a random string so we can matchup these from key: "", value: "" to key: value later on
    const random = tools.random();
    qs.push(prompter.buildQuestion('key.' + random, 'input', 'Key (i.e. my.config.key):'));
    qs.push(prompter.buildQuestion('value.' + random, 'input', 'Value:'));
    qs.push(prompter.buildQuestion('more', 'confirm', 'Add more configs:'));
  }

  return qs;
};

const askConfigQuestions = (r, config) => {
  config = config || {};
  return new Promise((res, rej) => {
    const firstTime = Object.keys(config).length <= 0;
    inquirer.prompt(buildConfigQuestions(r.auth, config, firstTime), (answers) => {
      Object.keys(answers).forEach(key => config[key] = answers[key]);
      if (answers.more) askConfigQuestions(r, config).then(innerR => res(innerR));
      else {
        delete config.more; // cleanup the 'more' property

        // combine the key/values
        Object.keys(config)
          .filter(c => c.startsWith('key.'))
          .reduce((p, c) => {
            const rando = c.split('.')[1]; // key.aeiond will ouput aeiond
            const key = 'key.' + rando;
            const value = 'value.' + rando;
            config[config[key]] = config[value];
            delete config[key]; // remove the key.randomstring
            delete config[value]; // remove the value.randomstring
          }, {});

        // delete any configs that have empty values
        Object.keys(config)
          .filter(c => !config[c])
          .reduce((p, c) => delete config[c], {});

        r.config = config;
        res(r);
      }
    });
  });
};

const stubPlatformFiles = (r) =>
  new Promise((res, rej) => {
    const rootDir = buildRootPlatformDir();
    const suiteDir = rootDir + '/' + r.name;
    if (fs.existsSync(suiteDir)) terminate('Platform suite %s already exists', r.name);

    // main suite files
    fs.mkdirSync(suiteDir);
    const jsFile = suiteDir + '/' + r.name + '.js';
    fs.createReadStream(__dirname + '/assets/platform.suite.template.js')
      .pipe(replaceStream('%name', r.name))
      .pipe(replaceStream('%user', process.env.USER))
      .pipe(fs.createWriteStream(jsFile));

    // asset files
    const assetsDir = suiteDir + '/assets';
    fs.mkdirSync(assetsDir);

    const resourceFile = assetsDir + '/' + r.name + '.json';
    fs.createReadStream(__dirname + '/assets/resource.template.json')
      .pipe(fs.createWriteStream(resourceFile));

    const schemaFile = assetsDir + '/' + r.name + '.schema.json';
    fs.createReadStream(__dirname + '/assets/resource.schema.template.json')
      .pipe(fs.createWriteStream(schemaFile));

    res(r);
  });

const stubElementFiles = (answers) =>
  new Promise((res, rej) => {
    const objectDefinitionsFile = buildRootElementDir() + '/assets/object.definitions.json';
    if (!fs.existsSync(objectDefinitionsFile)) fs.writeFileSync(objectDefinitionsFile, '{}');

    const suiteDir = buildRootElementDir() + '/' + answers.name;
    if (!fs.existsSync(suiteDir)) fs.mkdirSync(suiteDir);

    const assetsDir = suiteDir + '/assets';
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

    const transformationsFile = assetsDir + '/transformations.json';
    if (!fs.existsSync(transformationsFile)) fs.writeFileSync(transformationsFile, '{}');

    const config = answers.config;
    if (config) {
      let saucePath = (process.env.HOME || process.env.USERPROFILE) + '/.churros/sauce.json';
      let sauceConfig = require(saucePath);
      Object.keys(config).forEach(c => {
        const value = config[c];
        if (!sauceConfig[answers.name]) sauceConfig[answers.name] = {}; // init
        sauceConfig[answers.name][c] = value;
      });
      if (answers.auth !== 'standard') sauceConfig[answers.name].provisioning = answers.auth; // leave standard blank for now
      fs.writeFileSync(saucePath, JSON.stringify(sauceConfig, null, 2));
    }

    answers.resources.forEach(resource => {
      const name = resource.name;
      const vendorName = resource.vendorName;
      const vendorId = resource.vendorId;

      // resource .js file
      const resourceJsFile = suiteDir + '/' + name + '.js';
      if (!fs.existsSync(resourceJsFile)) {
        fs.createReadStream(__dirname + '/assets/element.suite.template.js')
          .pipe(replaceStream('%resource', name))
          .pipe(replaceStream('%hub', answers.hub))
          .pipe(replaceStream('%user', process.env.USER))
          .pipe(fs.createWriteStream(resourceJsFile));
      } else {
        console.log('test .js file already exists for %s so not modifying', name);
      }

      // resource file
      const resourceFile = assetsDir + '/' + name + '.json';
      fs.createReadStream(__dirname + '/assets/resource.template.json')
        .pipe(fs.createWriteStream(resourceFile));

      // transformation file
      const currentTransformations = require(transformationsFile);
      if (!currentTransformations[name]) {
        currentTransformations[name] = {
          vendorName: vendorName,
          fields: [{
            path: 'id',
            vendorPath: vendorId
          }]
        };
        fs.writeFileSync(transformationsFile, JSON.stringify(currentTransformations, null, 2));
      } else {
        console.log('transformation for %s already exists for %s', name, answers.name);
      }

      const objectDefinitions = require(objectDefinitionsFile);
      if (!objectDefinitions[name]) {
        objectDefinitions[name] = {
          fields: [{
            path: 'id',
            type: 'string'
          }]
        };
      } else {
        console.log('Object definition for %s already exists. To add fields to the object definition see elements/assets/object.definitions.json');
      }
    });

    res(answers);
  });

const complete = (r, link) => {
  console.log('');
  console.log('Successfully stubbed out test suite for %s', r.name);
  console.log('');
  console.log('For information on next steps:');
  console.log('    https://github.com/cloud-elements/churros/blob/master/CONTRIBUTING.md#%s', link);
  console.log('');
};

const add = (type, options) => {
  if (type === 'element') {
    buildElementQuestions(type)
      .then(r => prompter.askQuestions(r))
      .then(r => askConfigQuestions(r))
      .then(r => askResourceQuestions(r))
      .then(r => stubElementFiles(r))
      .then(r => complete(r, 'new-element-suite'))
      .catch(r => terminate(r));
  } else if (type === 'platform') {
    buildPlatformQuestions(type)
      .then(r => prompter.askQuestions(r))
      .then(r => stubPlatformFiles(r))
      .then(r => complete(r, 'new-platform-suite'))
      .catch(r => terminate(r));
  } else {
    terminate('Invalid type: %s', type);
  }
};

commander
  .command('type', '[element || platform]')
  .action((type, options) => add(type, options))
  .on('--help', () => {
    console.log('  Examples:');
    console.log('');
    console.log('    $ churros add element');
    console.log('    $ churros add platform');
    console.log('');
  })
  .parse(process.argv);