'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;
const cloud = require('core/cloud');
const payload = require('./assets/submit_producer');


suite.forElement('helpdesk', 'items', (test) => {
  test.should.return200OnGet();
  test.should.supportPagination();

  it('should allow C for /hubs/helpdesk/items/{sys_id}/submit_producer', () => {
    let sys_id = "01205b180a0a0b3000b6efd641d24b75";
    return cloud.post(`${test.api}/${sys_id}/submit_producer`, payload)
	  .then(r =>  expect(r).to.have.statusCode(200));
  });
});
