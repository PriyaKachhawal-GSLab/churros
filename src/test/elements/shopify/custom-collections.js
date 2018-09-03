'use strict';

const suite = require('core/suite');
const tools = require('core/tools');

const customCollection =  require('./assets/custom-collections-create');
const updatePayload =  require('./assets/custom-collections-update');

/*const customCollection = () => ({
  "title": tools.random()
});*/

suite.forElement('ecommerce', 'custom-collections', { payload: customCollection }, (test) => {


const options = {
churros: {
updatePayload: updatePayload
}
};


  test.should.supportCruds();
  test.withApi(`/hubs/ecommerce/custom-collections-count`).should.return200OnGet();
});
