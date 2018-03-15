'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const R = require('ramda');

const objectPayload = require('core/tools').requirePayload(`${__dirname}/assets/object.json`);

suite.forPlatform('vdrs/objects', {payload: objectPayload}, test => {

  // NOTE - you need the 'vdrAdmin' role to run these tests
  test.withOptions({churros: {updatePayload: R.assoc('objectName', 'updatedObjectName2', objectPayload)}}).should.supportCrud(chakram.put);

});
