'use strict';

const webdriver = require('selenium-webdriver');
const props = require('core/props');

module.exports = (element, method) => {
  const config = {
    username: props.getForKey(element, 'username'),
    password: props.getForKey(element, 'password')
  };
  const b = props.get('browser');
  const browser = new webdriver.Builder()
    .forBrowser(b)
    .build();
  switch (method) {
    case 'before':
      browser.get("https://accounts.zoho.com/u/h#sessions/userauthtoken");
      browser.switchTo().frame('zohoiam').catch(() => {});
      browser.sleep(1500);
      browser.findElement(webdriver.By.id('lid')).clear();
      browser.findElement(webdriver.By.id('lid')).sendKeys(config.username);
      browser.findElement(webdriver.By.id('pwd')).clear();
      browser.findElement(webdriver.By.id('pwd')).sendKeys(config.password);
      browser.findElement(webdriver.By.id('pwd')).submit();
      browser.sleep(3000);
      browser.findElement(webdriver.By.xpath('//*[@id="trow"]/td[1]/a'))
      .then(el => el.click().catch(() => {}), (err) => {});
      browser.findElement(webdriver.By.xpath('//*[@id="headerdiv"]/div'))
      .then(el => el.click().catch(() => {}), (err) => {});
      browser.findElement(webdriver.By.className('saveBtn'))
      .then(el => el.click().catch(() => {}), (err) => {});
      return browser.getCurrentUrl();

    default:
      return null;
  }
};
