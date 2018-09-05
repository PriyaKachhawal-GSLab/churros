'use strict';

const suite = require('core/suite');
const payload = require('./assets/external-activity-create');
const attributePayload = require('./assets/attributes-create');
const activityPayload =require('./assets/external-activity-update');
const cloud = require('core/cloud');

/*const activityPayload = build({
  apiName: tools.random(),
  triggerName: tools.random(),
  filterName: tools.random(),
  name: tools.random()
});*/
/*
Need different permissions for external-activities (ready-talk's sandbox)
    "username": "developer@cloud-elements.com",
    "password": "Cloud3l3m3nts!",
    "marketo.identity.url": "https://338-ZRW-745.mktorest.com/identity",
    "base.url": "https://338-ZRW-745.mktorest.com/rest",
*/
suite.forElement('marketing', 'external-activity', { payload: activityPayload, skip: true }, (test) => {
  it('should allow CS external-activity/types, PATCH external-activity/type/{apiName}/approve and PATCH external-activity/type/{apiName}/attributes ', () => {
    let apiName;
    return cloud.get(`${test.api}/types`)
      .then(r => cloud.post(`${test.api}/type`, activityPayload))
      .then(r => apiName = r.body[0].apiName)
      .then(r => cloud.patch(`${test.api}/type/${apiName}/approve`))
      .then(r => cloud.patch(`${test.api}/type/${apiName}/attributes`, attributePayload));
  });
});
