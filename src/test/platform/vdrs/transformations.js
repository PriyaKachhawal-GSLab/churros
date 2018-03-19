'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const R = require('ramda');

const objectPayload = require('core/tools').requirePayload(`${__dirname}/assets/object.json`);
const transformationPayload = require('core/tools').requirePayload(`${__dirname}/assets/transformation.json`);

suite.forPlatform('vdrs/objects/{id}/transformations', {payload: objectPayload}, test => {
    let objectId;
    before(() => {
      return cloud.post('/vdrs/objects', objectPayload)
        .then(r => {
          objectId = r.body.id;
        });
    });
  
    after(() => {
        if (objectId) cloud.delete(`/vdrs/objects${objectId}`);
    });

    // NOTE - you need the 'vdrAdmin' role to run these tests
    it('should test CRUDS for vdr transformations', () => {
        return cloud
            .withOptions({churros: {updatePayload: R.assoc('vendorName', 'updatedVendorName', transformationPayload)}})
            .cruds(`/vdrs/objects/${objectId}/transformations`, transformationPayload, null, chakram.put);
    });
});
