# churros <sub><sup>| Cloud Elements API Testing Framework </sup></sub>

--------------------------------------------------------------------------------

[![version](http://img.shields.io/badge/version-v0.5.0-blue.svg)](#) [![versioning](http://img.shields.io/badge/versioning-semver-blue.svg)](http://semver.org/) [![branching](http://img.shields.io/badge/branching-github%20flow-blue.svg)](https://guides.github.com/introduction/flow/)
[![Circle CI](https://circleci.com/gh/cloud-elements/churros.svg?style=shield)](https://circleci.com/gh/cloud-elements/churros)
[![Coverage Status](https://coveralls.io/repos/github/cloud-elements/churros/badge.svg?branch=master)](https://coveralls.io/github/cloud-elements/churros?branch=master)


## Overview
Integration testing framework for CE APIs, written in Javascript.  Provides testing for all things Cloud Elements, from platform resources (`elements`, `notifications`, etc.) to all of the current elements in our catalog (`sfdc`, `dropbox`, etc.).  This framework has up-to-date example JSON requests, example JSON transformations and much more.  These tests are run against our platform many times a day, guaranteeing that they represent what our platform supports *today*.

## How
Interact with the `churros` CLI to go about initializing `churros`, stubbing out tests and running tests.  When it comes to running tests, the `churros test` sub-command simply wraps the `mocha` executable, which is the framework that all of our tests run as.  The lower-level functions are all using the `chakram` node library to make HTTP requests, and then validation of payloads and HTTP responses is done using `chai` assertions.  The `churros` framework relies heavily on Javascript promises in order to manage the asynchronous nature of `nodejs`.  If you're new to Javascript, I recommend familiarizing yourself with promises before trying to write any of your own tests.

## Installation
If you don't have `node` and `npm` installed, do [that](https://docs.npmjs.com/getting-started/installing-node) first.

> __PROTIP:__ `node` version must  be >= `v6.3.0`

Install the node dependencies and initialize churros.

```bash
# Install all necessary npm packages:
$ npm install

# Need phantomjs to be installed globally or somehow available on your $PATH:
$ npm install --global phantomjs-prebuilt

# Puts churros CLI on your $PATH:
$ npm link

# Initialize your churros properties file:
$ churros init
```

> __PROTIP:__ May have to `sudo` the global install and `npm link` depending on your environment

> __PROTIP:__ You can pass `--template` to `churros init` if you have an existing sauce template
that you want to initialize from. It can accept both local filesystem paths and github urls:
  * `churros init --template /absolute/path/to/existing/sauce.json`
  * `churros init --template https://token@github.com/cloud-elements/churros-sauce/sauce.json`

> __PROTIP:__ You can set environment variables so that `churros init` does not prompt:
  * `CHURROS_USER`
  * `CHURROS_PASSWORD`
  * `CHURROS_URL`
  * `CHURROS_TEMPLATE`

> __PROTIP:__ `node` version `5.4.0` is prone to showing messages like the one below. Just ignore
them...

```bash
npm WARN ENOENT ENOENT: no such file or directory, open '/blah/blah/blah/churros/src/core/package.json'
```

> __PROTIP:__ Certain Firefox version are incompatible. You can find a compatible version [here](https://ftp.mozilla.org/pub/firefox/releases/45.0b7/mac/en-US/). Once you install, you will need to __immediately turn off automatic updates__ *(Firefox -> Preferences -> Advanced -> Update)*.

Lastly, if you don't have a personal ngrok account, you'll need to signup for a free account [here](https://dashboard.ngrok.com/user/signup).  After you have signed up, you should have a personal ngrok auth token that you'll need to setup on your computer per their instructions.

## `churros` CLI
It is worth taking some time to familiarize yourself with the `churros` CLI.  This CLI can run tests, help setup new test suites, and add/view properties that are needed in order to run certain suites.  Run `churros help` and dig through some of the different sub-commands that are currently available.  To see some examples of the most common command, `churros test`, continue on below.

## API Docs
For full API docs, see the API docs [here](http://cloud-elements.github.io/churros/).

## Examples

### Element Tests
To run the tests for any element, you must have the necessary properties setup for that element.  *ALL* properties for the elements below must be populated.  To see what properties are required, you can call `churros props {element}`.  You can also run `churros help props` for more info.

```bash
# Run all elements tests
$ churros test elements

# Run all elements tests except a suite
$ churros test elements --exclude 'onedrive'

# Run all elements tests starting at certain element
$ churros test elements --start 'box'

# Run the entire suite for the closeio element
$ churros test elements/closeio

# Run just the tests for the closeio contacts resource
$ churros test elements/closeio --test 'contacts'

# Run just the tests in the contacts.js file
$ churros test elements/closeio --file 'contacts'

# Run the entire suite for the sfdc element and during provisioning use the phantomjs browser
$ churros test elements/sfdc --browser phantomjs

# Run the polling tests if there are any
$ churros test elements/sfdc --polling

# Run suite on a existing instance(FOR DEVELOPMENT ONLY)
$ churros test elements/pipedrive --instance 1234

# Run suite with additional provisioning parameters
$ churros test elements/zuorav2 --params '{"zuorav2.sandbox": true}'
```

> __PROTIP:__ The `--test` value will search all tests `describe(...)` and `it(...)` strings to determine which test(s) to run
>__PROTIP:__ The `--file` value will run all the tests inside the JavaScript. Leave the `.js` off of the value
> __PROTIP:__ The `--browser` value defaults to `firefox`, however if you want to use a headless browser, you can pass `--browser phantomjs` as seen above
>__PROTIP:__ The `--params` requires valid JSON

### Platform Tests

#### All Platform
```bash
# Run all platform tests
$ churros test platform

# Run all platform tests except a suite
$ churros test platform --exclude 'bulk'

# Run all platform tests starting at certain suite
$ churros test platform --start 'jobs'

```

#### Formulas
```bash
# Run the entire formulas suite:
$ churros test platform/formulas

# Run all tests that contain 'should not allow':
$ churros test platform/formulas --test 'should not allow'

# Run all test that contain 'should allow' as a different user than is setup in your properties file:
$ churros test platform/formulas --test 'should allow' --user frank --password sinatra
```

> __PROTIP:__ Passing a `--user`, `--password` and/or `--url` to `churros test [suite]` overrides the default value that was setup during `churros init`.

#### Notifications
```bash
# Run the entire notifications suite:
$ churros test platform/notifications

# Run the entire notifications suite with verbose logging on:
$ churros test platform/notifications --verbose
```

> __PROTIP:__ Passing a `--verbose` to `churros test [suite]` will log all of the debug messages to the console while the tests are running.

#### Events
These tests create an instance of an element with event notifications enabled and the event notification callback URL as a locally exposed URL.  `churros` then simulates `x` number of events into our platform and ensures that our local callback receives `x` number of callbacks.

```bash
# Run the event tests, using the defaults in `churros props events`:
$ churros test platform/events

# Run the event tests, using sfdc as the element to simulate events:
$ churros test platform/events --element sfdc

# Run the event tests, using sfdc as the element to simulate events, sending in 25 events and waiting 60 seconds to receive them in churros:
$ churros test platform/events --element sfdc --load 25 --wait 60 --verbose
```

> __PROTIP:__ Passing a `--wait`, `--load` and/or `--element` to `churros test platform/events` overrides any default value that may be in your property file.

> __PROTIP:__ If you want to change the default port that is exposed to receive events, then change the `events:port` property by calling `churros props events:port <my_port>`

> __PROTIP:__ Some elements are not currently supported as they need to have an `events/assets/{element}.event.json` file setup so `churros` knows how to simulate events from that system.  If you run the event tests with an element that is not supported you will see an error message like:
```bash
$ churros test platform/events --element box
$ No box.event.json file found in the events/assets directory.  Please create this file before this element can be tested with events
```

## Known Limitations
* Currently, `churros` tests can *not* be run if you have authenticated into CE using SSO (GitHub, Google, etc.).

## Changelog
See [CHANGELOG.md](CHANGELOG.md)

## Contributing
See [CONTRIBUTING.md](.github/CONTRIBUTING.md)

## License
See [LICENSE.md](LICENSE.md)

