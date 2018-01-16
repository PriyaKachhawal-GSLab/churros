'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = tools.requirePayload(`${__dirname}/assets/expense-reports.json`);

const exepensePatch = {
  "employeeid": "1",
  "datecreated": {
    "year": "2016",
    "month": "09",
    "day": "09"
  },
  "dateposted": {
    "year": "2016",
    "month": "09",
    "day": "09"
  },
  "state": "Submitted",
  "description": "Travel to client",
  "memo": "FFFF",
  "itemid": "desk",
  "basecurr": "USD",
  "currency": "USD",
  "updateexpenses": {
    "expense": [{
      "employeeid": "2",
      "expensetype": "Telephone",
      "currency": "USD",
      "trx_amount": "12",
      "exchratetype": "Test",
      "form1099": "false",
      "locationid": "100",
      "memo": "Marriott",
      "paidfor": "Hotel",
      "amount": "50",
      "exchratedate": {
        "year": "2015",
        "month": "09",
        "day": "01"
      },
      "expensedate": {
        "year": "2015",
        "month": "09",
        "day": "01"
      },
      "customfields": {
        "customfield": [{
            "customfieldname": "TESTDATer1",
            "customfieldvalue": "12/10/2001"
          },
          {
            "customfieldname": "TESTTEXTer1",
            "customfieldvalue": "CustomFieldTexter1"
          }
        ]
      }
    }]
  },
  "customfields": {
    "customfield": [{
        "customfieldname": "TESTDATer1",
        "customfieldvalue": "12/10/2001"
      },
      {
        "customfieldname": "TESTTEXTer1",
        "customfieldvalue": "CustomFieldTexter1"
      }
    ]
  }
};

suite.forElement('finance', 'expense-reports', { payload: payload }, (test) => {
  it(`should allow CRDS for ${test.api}`, () => {
    return cloud.crds(test.api, payload);
  });
  it(`should allow PATCH for ${test.api}/{id}`, () => {
    let expenseId;
    return cloud.post(test.api, tools.requirePayload(`${__dirname}/assets/expense-reports.json`))
      .then(r => expenseId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${expenseId}`, exepensePatch))
      .then(r => cloud.delete(`${test.api}/${expenseId}`));
  });
  test.should.supportPagination();
  test.withName('should support updated > {date} Ceql search').withOptions({ qs: { where: "status='Draft'" } }).should.return200OnGet();
});
