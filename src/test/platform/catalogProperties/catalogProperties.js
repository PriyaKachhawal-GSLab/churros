'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const R = require('ramda');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forPlatform('catalogProperties', {}, test => {
  let elements;

  const genSingleEntry = () => {
    const getRandomIndex = () => Math.floor(Math.random() * elements.length);

    return {
      elementId: R.propOr(1, 'id', elements[getRandomIndex()]),
      hidden: false,
      position: getRandomIndex(),
      featured: true,
    };
  };

  const genList = () => Array.from({length: 5}, x => genSingleEntry());

  before(() => {
    return cloud.get('/elements?abridged=true').then(r => {
      elements = r.body;
    });
  });

  it('should support GET and PUT (batch upsert) endpoints', () => {
    const payload = genList();
    return cloud
      .get('/catalog-properties')
      .then(r => expect(r).to.have.statusCode(200))
      .then(() => cloud.put('/catalog-properties?entityType=user', payload))
      .then(r => expect(r).to.have.statusCode(200))
      .then(() => cloud.put('/catalog-properties?entityType=user', []))
      .catch(e => {
        cloud.put('/catalog-properties?entityType=user', []);
        throw new Error(e);
      });
  });
});
