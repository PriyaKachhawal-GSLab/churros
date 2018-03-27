'use strict';

const suite = require('core/suite');
const chakram = require('chakram');
const R = require('ramda');

const payload = require('core/tools').requirePayload(`${__dirname}/assets/vdr.json`);
const schema = require('core/tools').requirePayload(`${__dirname}/assets/vdr.schema.json`);
const pluralSchema = require('core/tools').requirePayload(`${__dirname}/assets/vdrs.schema.json`);
pluralSchema.definitions.vdr = schema;

suite.forPlatform('vdrs', {payload, schema}, test => {

  // NOTE - you need the 'vdrAdmin' role to run these tests
  test.withOptions({churros: {updatePayload: R.assoc('objectName', 'updatedObjectName2', payload)}}).should.supportCrud(chakram.put);
  test.withValidation(pluralSchema).should.return200OnGet();
});
