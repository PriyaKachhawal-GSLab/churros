'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');

const payload = require('./assets/orders-create.json');
const updatePayload = require('./assets/orders-update.json');


/*const order = (custom) => ({
  line_items: custom.line_items || [{
    title: tools.random(),
    price: tools.randomInt()
  }]
});*/

suite.forElement('ecommerce', 'orders', { payload: payload }, (test) => {
	
	
	
	const options = {
churros: {
updatePayload: updatePayload
}
};
	
	
  test.should.supportCruds();
  it('should allow GET for /orders with use of the `orderBy` parameter', () => {
    return cloud.withOptions({qs: {orderBy: 'updated_at'}}).get(test.api)
      .then(r => cloud.withOptions({qs: {orderBy: 'created_at'}}).get(test.api));
  });
});
