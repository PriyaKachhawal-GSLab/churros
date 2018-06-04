'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'leads', null, (test) => {
  //Currently we have this formId available with Leads, hence hardcoding the same.
  //Used https://developers.facebook.com/tools/lead-ads-testing to create leads
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
