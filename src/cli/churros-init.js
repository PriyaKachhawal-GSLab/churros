'use strict';

const prompt = require('prompt');
const optimist = require('optimist');
const fs = require('fs');
const commander = require('commander');

commander
  .option('-u, --user <user>', 'The user to run tests as', '')
  .option('-p, --password <password>', 'The password for the specified user', '')
  .option('-r, --url <url>', 'The url to run tests against', '')
  .parse(process.argv);

console.log('Initializating churros...');

prompt.message = "   ";
prompt.delimiter = "";
prompt.override = optimist.argv // allows for properties to be sent as command-line args

const prompts = {
  properties: {
    user: {
      required: true,
      description: 'Enter the default CE user to run churros as: '
    },
    password: {
      hidden: true,
      required: true,
      description: 'Enter the password for that user: '
    },
    url: {
      default: 'api.cloud-elements.com',
      description: 'Enter the default URL to run churros against: ',
      before: (url) => {
        if (url.startsWith('localhost')) url = 'http://' + url;
        if (!url.startsWith('http')) url = 'https://' + url;
        return url;
      }
    }
  }
};

prompt.start();
prompt.get(prompts, (err, result) => {
  const propsDir = process.env.HOME + '/.churros/';
  const file = propsDir + 'sauce.json';

  console.log('Saving default properties to ' + file);

  // directory doesn't exist? create it
  if (!fs.existsSync(propsDir)) fs.mkdirSync(propsDir);

  // props file doesn't exist? stub it out
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({}, null, 2));

  // load file and append our properties to it so we don't override properties that could already be there
  var properties = require(file);
  properties.user = result.user;
  properties.password = result.password;
  properties.url = result.url;

  fs.writeFile(file, JSON.stringify(properties, null, 2), (err) => {
    if (err) {
      console.log('Error while initializing churros');
      return console.log(err);
    }
    console.log('Finished initializing churros');
  });
});
