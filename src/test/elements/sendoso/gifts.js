'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const touchCreatePayload = tools.requirePayload(`${__dirname}/assets/touchCreate.json`);
const userCreatePayload = tools.requirePayload(`${__dirname}/assets/userCreate.json`);
const bulkGiftsPayload = tools.requirePayload(`${__dirname}/assets/bulkGifts.json`);
const eGiftsPayload = tools.requirePayload(`${__dirname}/assets/eGiftsLink.json`);

let giftsSendPayload = {
  send: {}
}

suite.forElement('rewards', 'gifts', { payload: giftsSendPayload }, (test) => {
  let touchId;
  before(() => {
    cloud.post('/hubs/rewards/touches', touchCreatePayload)
      .then(r => {
        touchId = r.body.touch.id;
        bulkGiftsPayload.send.touch_id = touchId;
        eGiftsPayload.send.touch_id = touchId;
        giftsSendPayload.send.touch_id = touchId;
        giftsSendPayload.send.amount = touchCreatePayload.touch.starting_egift_price;
      })
      .then(r => cloud.get('/hubs/rewards/users'))
      .then(r => giftsSendPayload.send.email = r.body[0].email);
  });

  test.should.supportCs();
  test.should.supportPagination();

  //Addding skip as it currently fails with budget limit error
  it.skip('should support C on /hubs/rewards/bulk-gifts', () => {
    return cloud.post('hubs/rewards/bulk-gifts', bulkGiftsPayload);
  });

  //Addding skip as it currently fails credit card declined error
  it.skip('should support C on /hubs/rewards/egift-links', () => {
    return cloud.post('hubs/rewards/egift-links', eGiftsPayload);
  });

  //Addding skip as it currently fails with 404 code from vendor side
  it.skip('should support S on /hubs/rewards/gift-preview', () => {
    return cloud.get('hubs/rewards/gift-preview');
  });

  after(() => cloud.delete(`/hubs/rewards/touches/${touchId}`));
});
