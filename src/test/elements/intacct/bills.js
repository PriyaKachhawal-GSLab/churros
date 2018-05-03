'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const vendorPayload = tools.requirePayload(`${__dirname}/assets/vendor.json`);

const payload = (vendorId) => ({
  "vendorid": vendorId,
  "datecreated": {
    "year": "2018",
    "month": "10",
    "day": "13"
  },
  "dateposted": {
    "year": "2018",
    "month": "10",
    "day": "13"
  },
  "datedue": {
    "year": "2018",
    "month": "10",
    "day": "26"
  },
  "termname": "N30",
  "action": "Draft",
  "billno": tools.random(),
  "ponumber": "222",
  "onhold": false,
  "description": "Description of bill",
  "basecurr": "USD",
  "currency": "USD",
  "exchrate": "0.875",
  "nogl": "F",
  "customfields": {
    "customfield": [{
        "customfieldname": "TESTDATE",
        "customfieldvalue": "12/10/2009"
      },
      {
        "customfieldname": "TESTTEXT",
        "customfieldvalue": "CustomFieldText"
      }
    ]
  },
  "billitems": {
    "lineitem": [{
      "glaccountno": "2000",
      "amount": "1234.56",
      "customfields": {
        "customfield": [{
            "customfieldname": "TESTDATE",
            "customfieldvalue": "12/10/2009"
          },
          {
            "customfieldname": "TESTTEXT",
            "customfieldvalue": "CustomFieldText"
          }
        ]
      },
      "billable": "false"
    }]
  }
});


suite.forElement('finance', 'bills', { payload: payload() }, (test) => {
  it(`should allow CRDS for ${test.api}`, () => {
    let vendorId;
    return cloud.post(`/hubs/finance/vendors`, vendorPayload)
      .then(r => vendorId = r.body.id)
      .then(r => cloud.cruds(test.api, payload(vendorId)))
      .then(r => cloud.delete(`/hubs/finance/vendors/${vendorId}`));
  });
  test.should.supportPagination();
  test.withName('should support updated > {date} Ceql search').withOptions({ qs: { where: 'whenmodified>\'08/13/2016 05:26:37\'' } }).should.return200OnGet();
});
