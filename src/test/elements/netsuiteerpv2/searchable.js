'use strict';

const suite = require('core/suite');
const model = require('core/model');

//let bills = '/hubs/erp/bills';

suite.forElement('erp', 'searchable', (test) => {  
  it('should allow find searchable fields hubs/erp/accounts', () => {
     return model.searchableFields('hubs/erp/accounts');
    // .then(r => model.searchableFields(bills));    
    //return model.searchableFields(bills);    
  });
});