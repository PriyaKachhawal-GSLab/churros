'use strict';

const fs = require('fs');
const commander = require('commander');
const file = (process.env.HOME || process.env.USERPROFILE) + '/.churros/sauce.json';

const loadFile = () => {
  return new Promise((resolve, reject) => {
    const config = require(file);
    config ?
      resolve(config) :
      reject(`No config found in '${file}'`);
  });
};

const display = (r, indent, heading) => {
  heading ? console.log(heading) : null;
  Object.keys(r).forEach((k) => {
    const value = typeof r[k] === 'object' ? '' : r[k];
    console.log('%s%s: %s', indent, k, value);
    if (typeof r[k] === 'object') display(r[k], indent + ' ');
  });
  console.log('');
};

const property = (key, value) => {
  console.log('');
  loadFile()
    .then(r => {
      // if value is a string, then we are displaying the property value, otherwise we are setting a new value
      if (typeof value !== 'string') {
        const keys = key.split(':');
        if (keys.length > 1) {
          const element = keys[0];
          const propKey = keys[1];
          console.log('%s\n', (r[element] === undefined || r[element][propKey] === undefined) ? '' : r[element][propKey]);
        } else {
          typeof r[key] === 'object' ?
            display(r[key], ' ', key + ':') :
            console.log('%s\n', r[key] === undefined ? '' : r[key]);
        }
      } else {
        const keys = key.split(':');
        if (keys.length > 1) {
          if (!r[keys[0]]) r[keys[0]] = {};
          r[keys[0]][keys[1]] = value;
        } else r[key] = value;

        fs.writeFile(file, JSON.stringify(r, null, 2), (err) => {
          if (err) console.log('Error while trying to set %s to %s', key, value);
          else console.log('Successfully set %s to %s', key, value);
          console.log('');
        });
      }
    })
    .catch(r => console.log(r));
};

commander
  .command('key [[element:]value]', 'property key')
  .action((key, value) => property(key, value))
  .option('-l, --list', 'list all of the current properties')
  .option('-d, --delete <[element:][key]>', 'delete the value for the given key')
  .on('--help', () => {
    console.log('  Examples:');
    console.log('');
    console.log('    $ churros props --list');
    console.log('    $ churros props url api.cloud-elements.com');
    console.log('    $ churros props box:username frank@ricard.com');
    console.log('    $ churros props box:username');
    console.log('    $ churros props box');
    console.log('    $ churros props --delete box:username');
    console.log('');
  })
  .parse(process.argv);

if (commander.list) {
  console.log('');
  loadFile()
    .then(r => display(r, ''))
    .catch(r => console.log(r));
}

if (commander.delete) {
  console.log('');
  loadFile()
    .then(r => {
      // support `churros props --delete box:username` and also `churros props --delete box`
      const keys = commander.delete.split(':');
      keys.length > 1 ?
        delete r[keys[0]][keys[1]] :
        delete r[commander.delete];

      fs.writeFile(file, JSON.stringify(r, null, 2), (err) => {
        if (err) console.log('Error while trying to delete value for %s', commander.delete);
        else console.log('Successfully deleted %s', commander.delete);
        console.log('');
      });
    })
    .catch(r => console.log(r));
}
