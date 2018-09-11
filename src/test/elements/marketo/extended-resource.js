'use strict';

const expect = require('chakram').expect;
const tools = require('core/tools');
const suite = require('core/suite');
const cloud = require('core/cloud');
const newResource = tools.requirePayload(`${__dirname}/assets/resources-create.json`);
const _ = require('lodash');

// Test for extending hubspot crm and invoking the extended resource
suite.forElement('marketing', 'extended-resource', {}, (test) => {
  let newResourceId;
  // Add resource to
  before(() => cloud.get('elements/marketo/resources')
    .then(r => {
      if (!_.isArray(r.body)) return null;
      return r.body.reduce((acc, cur) => acc = acc ? acc : cur.path === "/hubs/marketing/extended-resource" && cur.method.toUpperCase() === 'GET' ? cur.id : acc, null);
    })
    .then(id => id ? cloud.delete(`elements/marketo/resources/${id}`) : null)
    .then(() => cloud.post(`elements/marketo/resources`, newResource))
    .then(r => newResourceId = r.body.id));

  //delete new/overide resource should work fine
  after(() => cloud.delete(`elements/marketo/resources/${newResourceId}`));

  it('should test newly added account resource extended-resource', () => {
    return cloud.get(`extended-resource`)
      .then(r => {
        expect(r.body).to.not.be.empty;
      });
  });
});
