'use strict';

const R = require('ramda');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const provisioner = require('core/provisioner');
const suite = require('core/suite');
const definitions = require('./assets/object-definitions');

suite.forPlatform('transformation scripts', (test) => {
  let closeioId, contactId;
  before(() => provisioner.create('closeio')
    .then(r => closeioId = r.body.id)
    .then(r => cloud.get(`/hubs/crm/contacts`), (r) => expect(r.body.length).to.be.above(0)) // make sure we have a contact in this system or we can't run these tests
    .then(r => contactId = r.body[0].id));

  after(() => closeioId && provisioner.delete(closeioId));

  /**
   * Main wrapper for a test that goes about creating the object definitions, transformation, and then retrieving a contact
   * that is validated against your custom validator function.  Lastly, this function goes about cleaning up the created
   * object definition and transformation for the element instance ID that is used throughout all tests.
   */
  const scriptTest = (transformation, opts) => {
    const options = (opts || { isCleanup: true }); // default to cleaning up resources

    const transformationCreatedValidator = (r, value) => {
      expect(r).to.have.statusCode(200);
      expect(r.body.fields).to.not.be.empty;
      expect(R.find(R.has('script'))(r.body.fields)).to.not.be.empty;
      return r;
    };

    const validatorWrapper = (r) => {
      console.log('validate', r.body);
      const validator = (options.validator || ((object) => expect(object.foo).to.equal('bar')));
      expect(r).to.have.statusCode(200);
      expect(r.body).to.not.be.null;
      expect(r.body.console).to.be.empty;
      validator(r.body);
      return r;
    };

    return cloud.delete(`/instances/${closeioId}/objects/contacts/definitions`).catch(() => {})
      .then(r => cloud.post(`/instances/${closeioId}/objects/contacts/definitions`, definitions))
      .then(r => cloud.get(`/instances/${closeioId}/objects/contacts/definitions`))
      .then(r => cloud.delete(`/instances/${closeioId}/transformations/contacts`).catch(() => {}))
      .then(r => cloud.post(`/instances/${closeioId}/transformations/contacts`, transformation, (r) => transformationCreatedValidator(r, transformation.isLegacy ? transformation.isLegacy : false)))
      .then(r => cloud.get(`/hubs/crm/contacts/${contactId}`, validatorWrapper))
      .then(r => options.isCleanup ? cloud.delete(`/instances/${closeioId}/transformations/contacts`) : r)
      .then(r => options.isCleanup ? cloud.delete(`/instances/${closeioId}/objects/contacts/definitions`) : r);
  };

  /**
   * Loads a transformation from the given file name from the assets directory
   */
  const lt = (fileName) => require(`./assets/${fileName}`);

  it('should support field javascript with scripting engine to v2', () => scriptTest(lt('simple-v2-field-transformation')));

});
