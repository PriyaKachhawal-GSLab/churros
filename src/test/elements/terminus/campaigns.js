'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;

suite.forElement('marketing', 'campaigns', (test) => {
  test.withOptions({ qs: { id: 'ce8edcd8-610c-4627-a484-8b6e9b15925c' } }).should.supportS();
  it('should allow paginating with page and pageSize for hubs/makrketing/campaigns', () => {
    return cloud.withOptions({ qs: { id: 'ce8edcd8-610c-4627-a484-8b6e9b15925c', page: 1, pageSize: 2 } }).get(test.api)
      .then(r => expect(r.body.length).to.be.equal(2))
      .then(r => cloud.withOptions({ qs: { id: 'ce8edcd8-610c-4627-a484-8b6e9b15925c', page: 2, pageSize: 4 } }).get(test.api))
      .then(r => expect(r.body.length).to.be.equal(4));
  });
});
