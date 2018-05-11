'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const payload = (vendorId) => ({
  "vendorid": vendorId,
  "datecreated": {
    "year": "2018",
    "month": "03",
    "day": "31"
  },
  "dateposted": {
    "year": "2018",
    "month": "03",
    "day": "31"
  },
  "adjustmentno": tools.random(),
  "action": "Draft",
  "billno": "100",
  "description": tools.random(),
  "basecurr": "USD",
  "currency": "USD",
  "exchratetype": "Intacct Daily Rate",
  "apadjustmentitems": {
    "lineitem": [{
      "glaccountno": "2000",
      "amount": "-94.63",
      "memo": "History bill payment 100"
    }]
  }
});

const vendor = tools.requirePayload(`${__dirname}/assets/vendor.json`);

suite.forElement('finance', 'vouchers', { payload: payload() }, (test) => {
  it(`should allow CRDS for ${test.api}`, () => {
    let vendorId;
    return cloud.post(`/hubs/finance/vendors`, vendor)
      .then(r => vendorId = r.body.id)
      .then(r => cloud.cruds(test.api, payload(vendorId)))
      .then(r => cloud.delete(`/hubs/finance/vendors/${vendorId}`));
  });
  test.should.supportPagination();
  test.withName('should support updated > {date} Ceql search').withOptions({ qs: { where: 'whenmodified>\'08/13/2016 05:26:37\'' } }).should.return200OnGet();
});
