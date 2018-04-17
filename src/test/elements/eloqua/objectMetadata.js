'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('marketing', 'objectMetadata', (test) => {
  it('should return custom fields only when customFieldsOnly=true for contact' , () => {
    return cloud.withOptions({ qs:{  customFieldsOnly: true } }).get(`/objects/contact/metadata`)
    .then(r => expect(r.body.fields.filter(o => o.custom === true)).to.deep.equal(r.body.fields));
  });
  it('should return custom fields only when customFieldsOnly=true for account' , () => {
    return cloud.withOptions({ qs: { customFieldsOnly: true } }).get(`/objects/account/metadata`)
    .then(r => expect(r.body.fields.filter(o => o.custom === true)).to.deep.equal(r.body.fields));
  });
});