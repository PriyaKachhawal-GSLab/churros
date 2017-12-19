'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const defaults = require('core/defaults');
const provisioner = require('core/provisioner');
const newResource = require('./assets/elementextend/newresource.json');
const overrideResource = require('./assets/elementextend/overrideresource.json');
const newParameter = require('./assets/elementextend/parameter.json');
const newmodel = require('./assets/elementextend/model.json');
const objDefPayload = require('./assets/elementextend/modeldefinition.json');
const transformationPayload = require('./assets/elementextend/modeltransformation.json');
const swaggerSchema = require('./assets/elementextend/swagger.schema.json');
const elementSwaggerSchema = require('./assets/elementextend/elementswagger.schema.json');
const accountPayload = require('./assets/elementextend/account.json');
const userPayload = require('./assets/elementextend/user.json');

suite.forPlatform('element-extend', {}, (test) => {
  let baseElement, newResourceId;
  // Get a system element, count the resources
  before(() => cloud.get(`elements/closeio`)
    .then(r => baseElement = r.body));

  //delete new/overide resource should work fine
  after(() => cloud.delete(`elements/closeio/resources/${newResourceId}`));

    // Create a resource under system account
    it('should create new resource under system catalog element', () => {
      return cloud.post(`elements/closeio/resources`, newResource)
        .then(r => {
          expect(r.body).to.not.be.empty;
          expect(r.body.id).to.not.be.empty;
          newResourceId = r.body.id;
        });
    });

    // Get the element and check if element resources has the new resource
    it('should get system catalog element with resources and account resources', () => {
      return cloud.get(`elements/closeio/`)
        .then(r => {
          expect(r.body).to.not.be.empty;
          expect(r.body.id).to.not.be.empty;
          expect(r.body.resources.length === (baseElement.resources.length+1)).to.be.true;
        });
    });

    // Get all resources to see if the required resource is present
    it('should get all resources of system catalog element and account resources', () => {
      return cloud.get(`elements/closeio/resources`)
        .then(r => {
          expect(r.body).to.not.be.empty;
          expect(r.body.length === (baseElement.resources.length+1)).to.be.true;
        });
    });

    // Get accountOnly resources to see if the required resource is present
    it('should get accountOnly resources', () => {
      return cloud.withOptions({ qs: { accountOnly: true } }).get(`elements/closeio/resources`)
        .then(r => {
          expect(r.body).to.not.be.empty;
          expect(r.body.length === 1).to.be.true;
        });
    });

    // Get the newly created resource
    it('should get the newly created resource for the element', () => {
      return cloud.get(`elements/closeio/resources/${newResourceId}`)
        .then(r => {
          expect(r.body).to.not.be.empty;
          expect(r.body.path === `/hubs/crm/mynewcontacts`).to.be.true;
        });
    });

    // Create a new user
    // Using new user secrets get the resources to check if the newly created resources are not present
    // Get resources to check new/overide resources are not present
    // delete new/overide resource  should fail
    it('should create a new account and element in new account should not have access to new account resources', () => {
      let newAccount, newUser;
      return cloud.post(`accounts`, accountPayload)
        .then(r => newAccount = r.body)
        .then(() => cloud.post(`accounts/${newAccount.id}/users`, userPayload))
        .then(r => newUser = r.body)
        .then(r => {
          const secrets = defaults.secrets();
          const headers = {
            Authorization: `User ${newUser.secret}, Organization ${secrets.orgSecret}`
          };
          return cloud.withOptions({ headers }).get(`elements/closeio/resources`)
            .then(r => {
              expect(r.body).to.not.be.empty;
              expect(r.body.length === (baseElement.resources.length)).to.be.true;
            });
        })
        .then(() => cloud.delete(`users/${newUser.id}`))
        .then(() => cloud.delete(`accounts/${newAccount.id}`))
        .catch((e) => {
          if (newAccount) cloud.delete(`accounts/${newAccount.id}`);
          if (newUser) cloud.delete(`users/${newUser.id}`);
          throw new Error(e);
        });
    });

    // Execute the newly created resource and Execute the newly created resource and system resource
    it('should support creating an instance and execute the newly created instance', () => {
        let instance;
        return provisioner.create('closeio')
          .then(r => instance = r.body)
          .then(() => cloud.withOptions({ qs: { pageSize: 1 } }).get('hubs/crm/mynewcontacts', (r) => expect(r).to.have.statusCode(200)))
          .then(() => cloud.withOptions({ qs: { pageSize: 1 } }).get('hubs/crm/contacts', (r) => expect(r).to.have.statusCode(200)))
          .then(r => provisioner.delete(instance.id, 'elements/closeio/instances'))
          .catch((e) => {
            if (instance) provisioner.delete(instance.id, 'elements/closeio/instances');
            throw new Error(e);
          });
    });

    // Override a system resource
    it('should override the existing system catalog resource as new resource for the element', () => {
      let overrideResourceId;
      return cloud.post(`elements/closeio/resources`, overrideResource)
        .then(r => {
          expect(r.body).to.not.be.empty;
          expect(r.body.id).to.not.be.empty;
          overrideResourceId = r.body.id;
        })
        .then(() => cloud.delete(`elements/closeio/resources/${overrideResourceId}`))
        .catch((e) => {
          if (overrideResourceId) cloud.delete(`elements/closeio/resources/${overrideResourceId}`);
          throw new Error(e);
        });
    });

    // Get accountOnly resources to see if the 2 resource is present
    it('should get accountOnly resources', () => {
      return cloud.withOptions({ qs: { accountOnly: true } }).get(`elements/closeio/resources`)
        .then(r => {
          expect(r.body).to.not.be.empty;
          expect(r.body.length === 1).to.be.true;
        });
    });

    // Execute the overriden created resource
    it('should support creating an instance and execute the newly created instance', () => {
        let instance;
        return provisioner.create('closeio')
          .then(r => instance = r.body)
          .then(() => cloud.withOptions({ qs: { pageSize: 1 } }).get('hubs/crm/contacts', (r) => expect(r).to.have.statusCode(200)))
          .then(r => provisioner.delete(instance.id, 'elements/closeio/instances'))
          .catch((e) => {
            if (instance) provisioner.delete(instance.id, 'elements/closeio/instances');
            throw new Error(e);
          });
    });

    // try adding/update parameter to system resource and it should fail
    // delete system resource parameter and it should fail
    it('should return error while adding/updating or deleting parameters for system catalog resource', () => {
        let systemresource = baseElement.resources[0];
        let resourceId = systemresource.id;
        let parameterId = systemresource.parameters && systemresource.parameters.length > 0 ? systemresource.parameters[0].id : undefined;
        return cloud.post(`elements/closeio/resources/${resourceId}/parameters`, newParameter, (r) => expect(r).to.have.statusCode(404))
          .then(() => parameterId !== undefined ? cloud.put(`elements/closeio/resources/${resourceId}/parameters/${parameterId}`, newParameter, (r) => expect(r).to.have.statusCode(404)) : null)
          .then(() =>  parameterId !== undefined ? cloud.delete(`elements/closeio/resources/${resourceId}/parameters/${parameterId}`, (r) => expect(r).to.have.statusCode(404)) : null);
    });

    // try adding/update parameter to new resource and it should work
    // delete new resource parameter
    it('should CUD a parameter for newly created resource', () => {
        let newParameterId;
        return cloud.post(`elements/closeio/resources/${newResourceId}/parameters`, newParameter)
          .then(r => newParameterId = r.body.id)
          .then(() => cloud.put(`elements/closeio/resources/${newResourceId}/parameters/${newParameterId}`, newParameter))
          .then(() => cloud.delete(`elements/closeio/resources/${newResourceId}/parameters/${newParameterId}`))
          .catch((e) => {
            if (newParameterId) cloud.delete(`elements/closeio/resources/${newResourceId}/parameters/${newParameterId}`);
            throw new Error(e);
          });
    });

    // add/delete model to system resource and should fail
    it('should return error while adding or deleting resource model for system catalog resource', () => {
        let systemresource = baseElement.resources[0];
        let resourceId = systemresource.id;
        return cloud.post(`elements/closeio/resources/${resourceId}/models`, newmodel, (r) => expect(r).to.have.statusCode(404))
          .then(() => cloud.delete(`elements/closeio/resources/${resourceId}/models`, (r) => expect(r).to.have.statusCode(404)));
    });

    // add/delete model to new resource
    it('should be create and delete a model for newly created resource', () => {
        return cloud.post(`elements/closeio/resources/${newResourceId}/models`, newmodel)
          .then(() => cloud.delete(`elements/closeio/resources/${newResourceId}/models`))
          .catch((e) => {
            cloud.delete(`elements/closeio/resources/${newResourceId}/models`);
            throw new Error(e);
          });
    });

    // Should be able to create transformations for newly created model
    // should be able to execute the transformation
    // Should be able to delete the transformation on newly created model
    // add/delete model to new resource
    it('should be create/execute and delete transformation on the newly created model for newly created resource', () => {
        let instance;
        return cloud.post(`elements/closeio/resources/${newResourceId}/models`, newmodel)
          .then(() => provisioner.create('closeio'))
          .then(r => instance = r.body)
          .then(() => cloud.withOptions({ qs: { pageSize: 1 } }).get('hubs/crm/mynewcontacts', (r) => expect(r).to.have.statusCode(200)))
          .then(() => cloud.get('hubs/crm/objects/mynewcontacts/metadata'))
          .then(r => cloud.post(`instances/${instance.id}/objects/newtransformedcontacts/definitions`, objDefPayload))
          .then(r => cloud.post(`instances/${instance.id}/transformations/newtransformedcontacts`, transformationPayload))
          .then(r => cloud.get(`instances/${instance.id}/docs`, swaggerSchema))
          .then(r => cloud.get(`elements/${baseElement.id}/docs`, elementSwaggerSchema))
          .then(() => cloud.withOptions({ qs: { pageSize: 1 } }).get('hubs/crm/newtransformedcontacts', (r) => expect(r).to.have.statusCode(200)))
          .then(r => cloud.delete(`instances/${instance.id}/transformations/newtransformedcontacts`))
          .then(r => cloud.delete(`instances/${instance.id}/objects/newtransformedcontacts/definitions`))
          .then(r => provisioner.delete(instance.id, 'elements/closeio/instances'))
          .catch((e) => {
            if (instance) {
              cloud.delete(`instances/${instance.id}/transformations/newtransformedcontacts`);
              cloud.delete(`instances/${instance.id}/objects/newtransformedcontacts/definitions`);
              provisioner.delete(instance.id, 'elements/closeio/instances');
            }
            throw new Error(e);
          });
    });

});
