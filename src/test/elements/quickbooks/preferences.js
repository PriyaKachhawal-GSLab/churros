'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('finance', 'preferences', (test) => {

  test.should.supportPagination();
  it('should allow Patch for preferences', () => {
    let id,syncToken; 
    return cloud.get(test.api)
      .then(r =>{
	   if(r.body && r.body.length>0){
            id=r.body[0].Id;
	    syncToken=r.body[0].SyncToken;
	   }
      })
      .then(r => {
	   if(id && syncToken)
	   return  cloud.patch(`${test.api}/${id}`, { "SyncToken": syncToken, "sparse":false }); 
     });
  });
});

