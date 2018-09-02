'use strict';

const suite = require('core/suite');
const payload = require('./assets/smart-collection-create.json');
const updatepayload = require('./assets/smart-collection-update.json');

suite.forElement('ecommerce', 'smart-collections', { payload: payload }, (test) => {
	
	const options = {
churros: {
updatePayload: updatePayload
}
};
	
	
    test.withOptions(options).should.supportCruds();
});







