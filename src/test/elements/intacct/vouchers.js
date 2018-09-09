'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const vendorsCreatePayload = tools.requirePayload(`${__dirname}/assets/vendors-create.json`);
const vouchersCreatePayload = tools.requirePayload(`${__dirname}/assets/vouchers-create.json`);
const vouchersUpdatePayload = tools.requirePayload(`${__dirname}/assets/vouchers-update.json`);

const options = {
  churros: {
    updatePayload: vouchersUpdatePayload
  }
};

//for this resorces we need some specail permissions for doing CUD and account we are using in churros does not have that permissions hence APIs are failing for permission issue.  
suite.forElement('finance', 'vouchers', { payload: vouchersCreatePayload }, (test) => {
  let vendorlId;

  before(() => cloud.post(`hubs/finance/vendors`, vendorsCreatePayload)
    .then(r => {
      vendorlId = r.body.id;
      vouchersCreatePayload.vendorid = vendorlId;
      vouchersUpdatePayload.vendorid = vendorlId;
    }));

  after(() => cloud.delete(`hubs/finance/vendors/${vendorlId}`));

  test.should.supportPagination('id');
  test.withOptions(options).should.supportSr();
  // test.withOptions(options).should.supportCruds();
  test.withName('should support updated > {date} Ceql search').withOptions({ qs: { where: 'whenmodified>\'08/13/2016 05:26:37\'' } }).should.return200OnGet();
});