'use strict';

const suite = require('core/suite');
const faker = require('faker');

let product = { Code: faker.commerce.department() + '-' + faker.commerce.product()};

suite.forElement('finance', 'products', {payload: product}, (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();
    test.should.supportCrds();
});