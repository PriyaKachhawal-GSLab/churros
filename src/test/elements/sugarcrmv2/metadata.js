'use strict';
const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const objects = require('./assets/metadata');

suite.forElement('finance', `objects`, (test) => {
  return Promise.all(objects.map(obj => {
    it('should support GET /objects/{objectName}/metadata', () => {
      return cloud.get(`${test.api}/${obj}/metadata`);
    });

    it('should support GET /objects/{objectName}/metadata customFieldsOnly parameter', () => {
      return cloud.withOptions({ qs: { customFieldsOnly: true } }).get(`${test.api}/${obj}/metadata`).
      then(r => expect(r.body.fields.filter(field => (field.vendorPath.endsWith("_c") && field.custom === true))));
    });
  }));
});
