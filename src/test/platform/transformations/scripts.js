'use strict';

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
      expect(r.body.isLegacy).to.equal(value);
      return r;
    };

    const validatorWrapper = (r) => {
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
   * Represents a good update script test, where going from the original transformation to the updated transformation
   * should be successful and the API call should transform data properly.
   */
  const goodUpdateScriptTest = (original, update) => {
    return scriptTest(original, { isCleanup: false })
      .then(r => cloud.put(`/instances/${closeioId}/transformations/contacts`, update))
      .then(r => cloud.get(`/hubs/crm/contacts/${contactId}`, (r) => expect(r.body.foo).to.equal('bar')))
      .then(r => cloud.delete(`/instances/${closeioId}/transformations/contacts`))
      .then(r => cloud.delete(`/instances/${closeioId}/objects/contacts/definitions`));
  };

  /**
   * Represents a bad update script test, where going from the original transformation to the updated transformation
   * should return a 400 as it is not permitted.
   */
  const badUpdateScriptTest = (original, update) => {
    return scriptTest(original, { isCleanup: false })
      .then(r => cloud.put(`/instances/${closeioId}/transformations/contacts`, update, (r) => expect(r).to.have.statusCode(400)))
      .then(r => cloud.delete(`/instances/${closeioId}/transformations/contacts`))
      .then(r => cloud.delete(`/instances/${closeioId}/objects/contacts/definitions`));
  };

  /**
   * Loads a transformation from the given file name from the assets directory
   */
  const lt = (fileName) => require(`./assets/${fileName}`);

  it('should set the default scripting engine to v2', () => scriptTest(lt('simple-transformation')));
  it('should support setting the scripting engine to v1', () => scriptTest(lt('simple-v1-transformation')));
  it('should support setting the scripting engine to v2', () => scriptTest(lt('simple-v2-transformation')));
  it('should allow updating a transformation script from v1 to v2', () => goodUpdateScriptTest(lt('simple-v1-transformation'), lt('simple-v2-transformation')));
  it('should allow updating a transformation when both script engines are set to v2', () => goodUpdateScriptTest(lt('simple-v2-transformation'), lt('simple-v2-transformation')));
  it('should not allow updating a transformation script from v2 to v1', () => badUpdateScriptTest(lt('simple-v2-transformation'), lt('simple-v1-transformation')));
  it('should not allow updating a transformation script from no explicit script engine to v1', () => badUpdateScriptTest(lt('simple-transformation'), lt('simple-v1-transformation')));
  it('should allow default functions available', () => {
    const validateFuncs = body => {
      expect(body.email).to.be.a('string');
      expect(body.email).to.contain('@example');
      expect(body.base64).to.equal('Zm9vYmFyYmF6');
      expect(body.decode64).to.equal('foobarbaz');
      expect(body.hmacHard).to.equal(body.hmacEasy);
      expect(body.currencyCode).to.equal('USD');
      expect(body.currencySymbol).to.equal('€');
      expect(body.iso2CountryCode).to.equal('FR');
      expect(body.iso3CountryCode).to.equal('MEX');
    };
    return scriptTest(lt('transformationFunctions'), { isCleanup: true, validator: validateFuncs });
  });
});
