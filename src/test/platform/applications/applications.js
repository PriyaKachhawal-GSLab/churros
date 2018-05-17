'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
let application = require('./assets/application');

suite.forPlatform('applications', { payload: application }, (test) => {
  it(`should allow CRUD for applications`, () => {
    var companyId
    var applicationId
    return cloud.get('organizations/me')
      .then(r => {
        companyId = r.body.id
        application.company.id = companyId
      })
      .then(() => cloud.post('applications', application))
      .then(r => applicationId = r.body.id)
      .then(() => cloud.put(`applications/${applicationId}`, application))
      .then(r => cloud.get(`applications/${applicationId}`))
      .then(r => cloud.get('applications/all'))
      .then(() => cloud.delete(`applications/${applicationId}`))
      .catch(e => {
        if (applicationId) cloud.delete(`applications/${applicationId}`)
        throw new Error(e)
      })
  });

});