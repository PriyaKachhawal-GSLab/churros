'use strict';

const suite = require('core/suite');
const model = require('core/model');
const uri = 'hubs/helpdesk/incidents';

suite.forElement('helpdesk', 'searchable', (test) => {  
  it('should allow find searchable fields /hubs/helpdesk/incidents', () => {
    return model.searchableFields(uri);
  });
});