'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = {
    "shared_user_ids": [],
    "value_in_cents": 10000,
    "deal_stage_id": 1590316,
    "revenue_type": {
      "name": "Service",
      "id": 285121
    },
    "source": {
      "name": "Cold Call",
      "id": 1942474
    },
    "collaborators": [],
    "company": {
      "name": "PipelineDeals (sample)",
      "id": 83664673
    },
    "currency": {
      "symbol": "$",
      "code": "USD",
      "name": "American Dollar"
    },
    "value": "100.0",
    "summary": "this is a summary",
    "expected_close_date": "2017/12/31",
    "revenue_type_id": 285121,
    "deal_stage": {
      "name": "Negotiation",
      "id": 1590316,
      "percent": 75
    },
    "company_id": 83664673,
    "days_in_stage": 0,
    "probability": 50,
    "custom_fields": {
      "custom_label_2116258": "API test",
      "custom_label_2109196": "50.0"
    },
    "people": [
      {
        "last_name": "Parish",
        "id": 1159406032,
        "first_name": "thomas"
      }
    ],
    "is_sample": false,
    "primary_contact_id": 1159406032,
    "is_archived": false,
    "user_id": 435169,
    "person_ids": [
      1159406032
    ],
    "name": "patch test2",
    "source_id": 1942474,
    "user": {
      "last_name": "Wones",
      "id": 435169,
      "first_name": "Brian"
    },
    "primary_contact": {
      "last_name": "Parish",
      "id": 1159406032,
      "first_name": "thomas"
    },
    "status": 1
};

suite.forElement('helpdesk', 'deals', { payload: payload }, (test) => {
  it('should allow CRUDS for /deals', () => {
    const updatedPayload = {
      "person": {
        "lastName": tools.randomStr(),
        "firstName": tools.randomStr(),
        "email": tools.randomEmail()
      }
    };
    let id, value;
    return cloud.post(test.api, payload)
      .then(r => id = r.body.id)
      .then(r => value = `id in ( ${id} )`)
      .then(r => cloud.get(`${test.api}/${id}`))
      .then(r => cloud.patch(`${test.api}/${id}`, updatedPayload))
      .then(r => cloud.withOptions({ qs: { where: `${value}` } }).get(`${test.api}`))
      .then(r => cloud.delete(`${test.api}/${id}`));
  });
});
