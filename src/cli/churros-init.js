'use strict';

const commander = require('commander');
const fs = require('fs');
const github = new require('github')({});
const inquirer = require('inquirer');
const optimist = require('optimist')
  .default('user', process.env.CHURROS_USER)
  .default('password', process.env.CHURROS_PASSWORD)
  .default('url', process.env.CHURROS_URL)
  .default('template', process.env.CHURROS_TEMPLATE);
const url = require('url');

commander
  .option('-u, --user <user>', 'default CE user to run churros as', '')
  .option('-p, --password <password>', 'password for that user', '')
  .option('-r, --url <url>', 'default CE url to run churros against', '')
  .option('-t, --template </full/path/to/template/file | https://token@github.com/owner/repo/sauce.json', 'path or url to sauce template', __dirname + '/assets/sauce.template.json')
  .parse(process.argv);

const validateValue = (value) => value ? true : 'Must enter a value';

const terminate = (msg, args) => {
  console.log(msg, args ? args : '');
  process.exit(1);
};

const buildQuestion = (name, type, message, validate, defaultValue) => {
  return {
    name: name,
    type: type,
    message: message,
    validate: validate,
    default: defaultValue
  };
};

const saveSauce = (answers) => {
  const propsDir = (process.env.HOME || process.env.USERPROFILE) + '/.churros/';
  const file = propsDir + 'sauce.json';

  const format = (url) => {
    if (url.startsWith('localhost')) url = 'http://' + url;
    if (!url.startsWith('http')) url = 'https://' + url;
    return url;
  };

  const template = (frm, to) => new Promise ((resolve, reject) => {
    if (frm.indexOf('https') === 0) {
      const purl = url.parse(frm);
      const token = purl.auth;
      const user = purl.pathname.split('/')[1];
      const repo = purl.pathname.split('/')[2];
      const path = purl.pathname.split('/')[3];

      console.log('Writing sauce template from repo');
      github.authenticate({ type: 'oauth', token: token});
      github.repos.getContent({ user: user, repo: repo, path: path }, function(err, resp) {
        if (err) reject('Error writing sauce template from repo');
        fs.writeFileSync(to, new Buffer(resp.content, 'base64').toString('utf8'));
        resolve({ frm: frm, to: to });
      });
    } else {
      console.log('Writing sauce template from filesystem');
      if (!fs.existsSync(frm)) reject('Error writing sauce template from filesystem');
      fs.writeFileSync(to, fs.readFileSync(frm));
      resolve({ frm: frm, to: to });
    }
  });

  const mkdirp = (dir) => new Promise((resolve, reject) => {
    console.log('Making sauce directory');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    resolve(dir);
  });

  const write = (to, props) => new Promise((resolve, reject) => {
    console.log('Writing sauce file');
    fs.writeFile(to, JSON.stringify(props, null, 2), (err) => {
      err ? reject('Error writing sauce file') : resolve({ to: to, props: props });
    });
  });

  mkdirp(propsDir)
    .then(r => template(commander.template, r + 'sauce.template.json'))
    .then(r => {
      let props = require(r.to);
      props.url = format((answers.url || optimist.argv.url));
      props.user = answers.user || optimist.argv.user;
      props.password = answers.password || optimist.argv.password;

      write(file, props);
    })
    .then(r => console.log('Churros initialization successful!'))
    .catch(err => terminate('Churros initialization failed', err));
};

const questions = [];
if (!optimist.argv.user) questions.push(buildQuestion('user', 'input', 'Default user to run tests:', (value) => validateValue(value)));
if (!optimist.argv.password) questions.push(buildQuestion('password', 'password', 'User\'s password:', (value) => validateValue(value)));
if (!optimist.argv.url) questions.push(buildQuestion('url', 'url', 'Cloud Elements URL', (value) => validateValue(value), 'api.cloud-elements.com'));

inquirer.prompt(questions, (answers) => saveSauce(answers));
