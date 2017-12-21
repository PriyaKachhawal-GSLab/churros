'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const payload = require('./assets/payload.json');
const schema = require('./assets/payload.schema.json');

suite.forPlatform('models', {}, (test) => {
  it('should generate model schema from payload', () => {
        return cloud.post('/models/invoices/schema', payload, schema);
  });
});
