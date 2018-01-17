'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const payload = {
    "predefined_contacts_tags": [],
    "predefined_contacts_tag_ids": [],
    "image_mobile_url": "//assets.pipelinedeals.com/current/webpack/images/mobile/missing-3f2639f860da74fd0c46d62bd792ee9e.png",
    "last_name": "Unknown",
    "deal_ids": [],
    "type": "Contact",
    "bounced": false,
    "work_address_google_maps_url": "http://maps.google.com/maps?q=%2C+%2C+%2C+++",
    "image_thumb_url": "//assets.pipelinedeals.com/current/webpack/images/thumb/missing-67f411c9ac1a58df124ce144b41cd8d2.png",
    "is_sample": false,
    "unsubscribed": false,
    "full_name": "Unknown",
    "total_pipeline": "0.0",
    "updated_at": "2018/01/15 15:36:51 -0800",
    "user_id": 435169,
    "deals": [],
    "won_deals_total": "0.0",
    "user": {
      "last_name": "Wones",
      "id": 435169,
      "first_name": "Brian"
    }
};

suite.forElement('helpdesk', 'contacts', { payload: payload }, (test) => {
  it('should allow CRUDS for /contacts', () => {
    const updatedPayload = {
        "user": {
          "last_name": tools.randomStr(),
          "first_name": tools.randomStr()
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
