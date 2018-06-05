'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'leads', null, (test) => {
  //Used https://developers.facebook.com/tools/lead-ads-testing to create test leads
  //Otherwise you need to pay for publishing the ad and then create leads under it
  //Currently we have this formId available with test Leads, hence hardcoding the same.
  //Value of formLeadId will change if you delete the existing lead.
  let formId = 1856949527939272;
  it('should allow R for /hubs/marketing/forms/{formId}/leads', () => {
    return cloud.get(`/hubs/marketing/forms/${formId}/leads`)
      .then(r => cloud.withOptions({ qs: { fields: 'created_time,form_id' } }).get(`/hubs/marketing/forms/${formId}/leads`));
  });
  // As we do not have a GET all API for leads, hardcoding the leadId
  let leadId = 239907496137483;
  it('should allow R for /hubs/marketing/leads', () => {
    return cloud.get(`${test.api}/${leadId}`)
      .then(r => cloud.withOptions({ qs: { fields: 'id,name' } }).get(`${test.api}/${leadId}`));
  });
});
