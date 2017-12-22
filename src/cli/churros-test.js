'use strict';

const path = require('path');
const fs = require('fs');
const commander = require('commander');
const shell = require('shelljs');
const prompter = require('./assets/prompter');

const collect = (val, list) => {
  list.push(val);
  return list;
};

const validateValue = (value) => value ? true : 'Must enter a value';

const fromOptions = (url, options) => {
  return new Promise((res, rej) => {
    res({
      url: url,
      user: options.user,
      password: options.password,
      wait: options.wait,
      load: options.load,
      loadElement: options.element,
      start: options.start,
      browser: options.browser,
      verbose: options.verbose === undefined ? false : options.verbose, // hack...i can't figure out why it's not default to false
      externalAuth: options.externalAuth,
      exclude: options.exclude,
      instance: options.instance,
      params: options.params,
      save: options.save === undefined ? false : true,
      polling: options.polling,
      backup: options.backup === undefined ? 'use backup' : options.backup, //defaults to use back up instance
      transform: options.transform,
      sync: options.sync
    });
  });
};

const parse = (options) => {
  let url = options.url;
  if (url && url.startsWith('localhost')) url = 'http://' + url;
  if (url && !url.startsWith('http')) url = 'https://' + url;

  // if the user passed the --password flag, then prompt them for their password before continuing
  if (options.password) {
    const qs = [prompter.buildQuestion('password', 'password', 'Enter password:', (value) => validateValue(value))];
    return prompter.askQuestions(qs)
      .then(r => options.password = r.password)
      .then(r => fromOptions(url, options));
  }
  return fromOptions(url, options);
};

const isRunMultiple = (suite) => suite.indexOf('/') < 0;

const isElement = (suite) => suite.startsWith('element');

const run = (suite, options, cliArgs) => {
  const file = options.file;
  const test = options.test;

  // ugly as all get out ...
  const rootDir = path.dirname(require.main.filename);
  const rootTestDir = rootDir + '/../test';

  const resources = [];
  const resourceType = suite.split('/')[0];

  // always pass the lifecycle file first.  if it's an element, then use that element's lifecycle file too
  const baseMochaPaths = [rootTestDir + '/lifecycle'];
  if (isElement(suite)) baseMochaPaths.push(`${rootTestDir}/elements/lifecycle`);
  if (isElement(suite)) baseMochaPaths.push(`${rootTestDir}/elements/assets/basics`);

  const isAfterStart = (start, suite, arr) => {
    if (!start) return true;
    let folderPath = `${rootTestDir}/${resourceType}/${start}`;
    if (!fs.existsSync(folderPath)) {
      console.log('Invalid suite: %s', start);
      process.exit(1);
    }
    return arr.indexOf(suite) >= arr.indexOf(start);
  };

  // if we want to run multiple tests, we need to find all of the available element or platform tests and add them to our resources array
  isRunMultiple(suite) ?
    fs.readdirSync(`${rootTestDir}/${resourceType}`)
    .filter(e => e !== 'assets' && options.exclude.indexOf(e) < 0)
    .filter((e, i, self) => isAfterStart(options.start, e, self))
    .map(e => resources.push(e)) :
    resources.push(suite.split('/')[1]);

  let args = `--timeout 600000 --reporter spec --ui bdd`;
  if (test) args += ` --grep '${test}'`;
  if (cliArgs.url) args += ` --url ${cliArgs.url}`;
  if (cliArgs.user) args += ` --user ${cliArgs.user}`;
  if (cliArgs.password) args += ` --password ${cliArgs.password}`;
  if (cliArgs.load) args += ` --load ${cliArgs.load}`;
  if (cliArgs.wait) args += ` --wait ${cliArgs.wait}`;
  if (cliArgs.loadElement) args += ` --loadElement ${cliArgs.loadElement}`;
  if (cliArgs.verbose) args += ` --verbose ${cliArgs.verbose}`;
  if (cliArgs.browser) args += ` --browser ${cliArgs.browser}`;
  if (cliArgs.externalAuth) args += ` --externalAuth`;
  if (cliArgs.instance) args += ` --instance ${cliArgs.instance}`;
  if (cliArgs.polling) args += ` --polling ${cliArgs.polling}`;
  if (cliArgs.params) args += ` --params '${cliArgs.params}'`;
  if (cliArgs.save) args += ` --save '${cliArgs.save}'`;
  if (cliArgs.backup) args += ` --backup '${cliArgs.backup}'`;
  if (cliArgs.transform) args += ` --transform`;
  if (cliArgs.sync) args += ` --sync`;
  // loop over each element, constructing the proper paths to pass to mocha
  let cmd = "";
  if (resources.includes('.DS_Store')) resources.splice(resources.indexOf('.DS_Store'), 1);
  resources.forEach((resource, index) => {
    const allMochaPaths = baseMochaPaths.slice();
    let baseResource = resource;
    if (resource.includes('--')) {
      baseResource = resource.substring(0, resource.indexOf('--'));
    }
    // validate the root suite path before continuing
    let testPath = `${rootTestDir}/${resourceType}/${baseResource}`;
    if (!fs.existsSync(testPath)) {
      console.log('Invalid suite: %s', suite);
      process.exit(1);
    }
    // add the suite next, unless a specific file was passed
    if (file.length < 1) allMochaPaths.push(testPath);
    else {
      file.forEach((s) => {
        let filePath = testPath + '/' + s;
        if (!fs.existsSync(filePath + '.js')) {
          console.log('Invalid file: %s', s);
          process.exit(1);
        }
        allMochaPaths.push(filePath);
      });
    }

    cmd += `${rootDir}/../../node_modules/.bin/mocha ${allMochaPaths.join(' ')} ${args}`;
    if (isElement(suite)) cmd += ` --element ${resource}`;
    if (index !== resources.length - 1) cmd += " && "; // not the last one, then append &&
  });

  process.exit(shell.exec(cmd).code); // execute the cmd and make our exit code the same as 'churros test' code
};

const runTests = (suite, options) => {
  return parse(options)
    .then(cliArgs => run(suite, options, cliArgs))
    .catch(r => {
      console.log('Failed to run tests: ', r);
      process.exit(1);
    });
};

commander
  .command('suite', 'suite to test')
  .action((suite, options) => runTests(suite, options))
  .option('-s, --file <file>', 'file(s) of tests to run (exclude the .js)', collect, [])
  .option('-t, --test <test>', 'specific test(s) to run.  This searches through all "describe(...)" and "it(...)" strings')
  .option('-e, --element <element>', 'element to use while running this specific suite (only available for "churros test events")')
  .option('-l, --load <#>', 'specifies the specific load to test with (only available for "churros test events")')
  .option('-w, --wait <#>', 'how long to wait for tests to complete (only available for "churros test events")')
  .option('-r, --url [url]', 'overrides the default URL setup during initialization')
  .option('-u, --user <user>', 'overrides the default user setup during initialization')
  .option('-p, --password', 'overrides the default password setup during initialization (this will prompt you for your password)')
  .option('-x, --externalAuth', 'provision using external authentication. only for elements tests')
  .option('-b, --browser <name>', 'browser to use during the selenium OAuth process', 'firefox') // will change this to phantomjs as churros becomes more mature
  .option('-s, --exclude <resource>', 'element(s) or platform resource(s) to exclude if running all tests', collect, [])
  .option('-S, --start <suite>', 'specific suite to start with, everything before this will be skipped')
  .option('-V, --verbose', 'logging verbose mode')
  .option('-i, --instance <instance>', 'element instance ID to run tests against (for development only)')
  .option('--polling', 'runs the polling tests')
  .option('-P, --params <json>', 'add additional parameters for provisioning')
  .option('--save', 'don\'t run the clean up process before')
  .option('--backup <arg>', 'options to use backup instance. options: ["use backup", "no backup", "only backup"]. Defaults to "use backup"')
  .option('--transform', 'creates a transformation on all resources and runs test off new transformations')
  .option('--sync', 'runs the basic tests synchronously')
  .on('--help', () => {
    console.log('  Examples:');
    console.log('');
    console.log('    # Element Tests');
    console.log('    $ churros test elements/closeio');
    console.log('    $ churros test elements/closeio --test \'contacts\'');
    console.log('    $ churros test elements/closeio --file \'contacts\'');
    console.log('    $ churros test elements/sfdc --polling');
    console.log('    $ churros test elements/zuorav2 --params \'{"zuorav2.sandbox": true}\'');
    console.log('    $ churros test elements/zuorav2 --save');
    console.log('    $ churros test elements/hubspot --backup "no backup"');
    console.log('    $ churros test elements/box --transform');
    console.log('    $ churros test elements/pardot --sync');
    console.log('    $ churros test elements');
    console.log('    $ churros test elements --exclude autopilot --exclude bigcommerce');
    console.log('    $ churros test elements --start freshbooks');
    console.log('');
    console.log('    # Platform Tests');
    console.log('    $ churros test platform/notifications');
    console.log('    $ churros test platform/formulas');
    console.log('    $ churros test platform/formulas --test \'should not allow\'');
    console.log('    $ churros test platform/events --element sfdc');
    console.log('    $ churros test platform/events --element sfdc --load 50 --wait 60');
    console.log('    $ churros test platform');
    console.log('    $ churros test platform --exclude formulas --exclude elements');
    console.log('');
  })
  .parse(process.argv);
