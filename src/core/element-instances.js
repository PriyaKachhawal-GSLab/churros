'use strict';

const util = require('util');
const chakram = require('chakram');
const expect = chakram.expect;
const auth = require('core/auth');
const webdriver = require('selenium-webdriver');
const props = require('core/props');
const url = require('url');

const elements = {
  box: (r, username, password, driver) => {
    driver.get(r.body.oauthUrl);
    driver.findElement(webdriver.By.name('login')).sendKeys(username);
    driver.findElement(webdriver.By.name('password')).sendKeys(password);
    driver.findElement(webdriver.By.name('login_submit')).click();
    driver.findElement(webdriver.By.name('consent_accept')).click();
    return driver.getCurrentUrl();
  },
  sfdc: (r, username, password, driver) => {
    driver.get(r.body.oauthUrl);
    driver.findElement(webdriver.By.id("username")).clear();
    driver.findElement(webdriver.By.id("username")).sendKeys(username);
    driver.findElement(webdriver.By.id("password")).clear();
    driver.findElement(webdriver.By.id("password")).sendKeys(password);
    driver.findElement(webdriver.By.id("Login")).click();
    driver.get(driver.getCurrentUrl()); // have to actually go to it and then it redirects you to your callback
    return driver.getCurrentUrl();
  },
  dropbox: (r, username, password, driver) => {
    driver.get(r.body.oauthUrl);
    driver.wait(() => {
      return driver.findElement(webdriver.By.name('login_email')).click()
        .then(() => {
          return true;
        })
        .thenCatch(() => {
          return false;
        })
    }, 10000);
    driver.findElement(webdriver.By.name('login_email')).sendKeys(username);
    driver.findElement(webdriver.By.name("login_password")).clear();
    driver.findElement(webdriver.By.name("login_password")).sendKeys(password);
    driver.findElement(webdriver.By.className("login-button")).click();
    return driver.getCurrentUrl();
  },
  facebooksocial: (r, username, password, driver) => {
    driver.get(r.body.oauthUrl);
    driver.findElement(webdriver.By.id('email')).clear();
    driver.findElement(webdriver.By.id('email')).sendKeys(username);
    driver.findElement(webdriver.By.id('pass')).clear();
    driver.findElement(webdriver.By.id('pass')).sendKeys(password);
    driver.findElement(webdriver.By.id('loginbutton')).click();
    return driver.getCurrentUrl();
  }
};

var exports = module.exports = {};

exports.all = () => {
  const url = '/instances';
  return chakram.get(url)
    .then(r => {
      expect(r).to.have.status(200);
      return r.body;
    })
    .catch(r => {
      console.log('Failed to retrieve element instances: ' + r);
    });
};

exports.create = (element, args) => {
  const callback = elements[element];

  if (callback) {
    // endpoint-specific properties
    const callbackUrl = props.get('oauth.callback.url');

    const apiKey = props.get(element)['oauth.api.key'];
    const apiSecret = props.get(element)['oauth.api.secret'];
    const username = props.get(element)['username'];
    const password = props.get(element)['password'];

    const options = {
      qs: {
        apiKey: apiKey,
        apiSecret: apiSecret,
        callbackUrl: callbackUrl
      }
    };
    const driver = new webdriver.Builder()
      .forBrowser('phantomjs')
      .build();
    const oauthUrl = util.format('/elements/%s/oauth/url', element);

    return chakram.get(oauthUrl, options)
      .then(r => {
        return callback(r, username, password, driver);
      })
      .then(r => {
        const query = url.parse(r, true).query;
        const instance = {
          name: 'churros-instance',
          element: {
            key: element
          },
          configuration: {
            'oauth.api.key': apiKey,
            'oauth.api.secret': apiSecret,
            'oauth.callback.url': callbackUrl
          },
          providerData: {
            code: query.code
          }
        };
        return chakram.post('/instances', instance);
      })
      .then(r => {
        expect(r).to.have.status(200);
        console.log('Created %s element instance with ID: %s', element, r.body.id);
        auth.setup(r.body.token);
        driver.close();
        return r;
      })
      .catch(r => {
        console.log('Failed to create an instance of %s: %s', element, r);
        driver.close();
        process.exit(1);
      });
  } else {
    const instance = {
      name: 'churros-instance',
      element: {
        key: element
      },
      configuration: props.all(element)
    };

    return chakram.post('/instances', instance)
      .then(r => {
        expect(r).to.have.status(200);
        console.log('Created %s element instance with ID: %s', element, r.body.id);
        auth.setup(r.body.token);
        return r;
      })
      .catch(r => {
        console.log('Failed to create an instance of %s: %s', element, r);
        process.exit(1);
      });
  }
};

exports.delete = (id) => {
  const url = '/instances/' + id;
  return chakram.delete(url)
    .then(r => {
      expect(r).to.have.status(200);
      console.log('Deleted element instance with ID: ' + id);
      auth.setup();
      return r.body;
    })
    .catch(r => {
      console.log('Failed to delete element instance: ' + r);
    });
};
