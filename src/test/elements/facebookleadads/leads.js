'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('marketing', 'leads', null, (test) => {
  // As we do not have a GET all API for leads, hardcoding the leadId
  let leadId = 239907496137483;
  it('should allow R for /hubs/marketing/leads', () => {
    return cloud.get(`${test.api}/${leadId}`)
      .then(r => cloud.withOptions({ qs: { fields: 'id,name' } }).get(`${test.api}/${leadId}`));
  });
});
