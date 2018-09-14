'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const props = require('core/props');
const common = require('./assets/common');
const keysSchema = require('./assets/keys.schema.json');
const schema = require('./assets/element.schema.json');
const listSchema = require('./assets/elements.schema.json');
const logger = require('winston');
const faker = require('faker');

const getElementId = (key) => {
  return cloud.get(`elements/${key}`)
    .then(r => r.body.id);
};

const crudElement = (idField, payload, updatedPayload, schema) => {
  let element, id;
  return common.deleteElementByKey('churrosdbelement')
    .then(r => cloud.post('elements', payload, schema))
    .then(r => element = r.body)
    .then(r => {
      expect(element.configuration).to.not.be.empty;
      const match = element.configuration.filter(c => c.key  === 'base.url');
      expect(match.length).to.equal(1);
      if(match[0].key === 'base.url') {
        expect(match[0].defaultValue).to.not.be.empty;
      }
    })
    .then(r => id = element[idField])
    .then(r => cloud.get(`elements/${id}`, schema))
    .then(r => cloud.put(`elements/${id}`, updatedPayload, schema))
    .then(r => {
      const updatedElement = r.body;
      expect(updatedElement.configuration).to.not.be.empty;
      const match = updatedElement.configuration.filter(c => c.key  === 'base.url');
      expect(match.length).to.equal(1);
      if(match[0].key === 'base.url') {
        expect(match[0].defaultValue).to.not.be.empty;
      }
    })
    .then(r => cloud.delete(`elements/${id}`))
    .catch(e => {
      if (id) cloud.delete(`elements/${id}`);
      throw new Error(e);
    });
};

const testElementActivation = (idField, schema) => {
  let element;
  return common.deleteElementByKey('churros')
    .then(r => cloud.post('elements', common.genElement({}), schema))
    .then(r => element = r.body)
    .then(r => cloud.put(`elements/${element[idField]}/active`))
    .then(r => cloud.get(`elements/${element[idField]}`, (r) => expect(r.body.active).to.equal(true)))
    .then(r => cloud.delete(`elements/${element[idField]}/active`))
    .then(r => cloud.get(`elements/${element[idField]}`, (r) => expect(r.body.active).to.equal(false)))
    .then(r => cloud.delete(`elements/${element[idField]}`))
    .catch(e => {
      if (element) {
        cloud.delete(`elements/${element[idField]}/active`);
        cloud.delete(`elements/${element[idField]}`);
      }
      throw new Error(e);
    });
};

const testOAuthUrl = (idOrKey) => {
  return cloud.withOptions({ qs: { apiKey: 'abcdefg', apiSecret: '1234567', callbackUrl: 'http://localhost:8080' } }).get(`elements/${idOrKey}/oauth/url`, r => {
    expect(r.body).to.not.be.empty;
    expect(r.body.element).to.equal('sfdc');
    expect(r.body.oauthUrl).to.not.be.empty;
  });
};

const testOAuthUrlPost = (idOrKey) => {
  return cloud.post(`elements/${idOrKey}/oauth/url`, { apiKey: 'abcdefg', apiSecret: '1234567', callbackUrl: 'http://localhost:8080' }, r => {
    expect(r.body).to.not.be.empty;
    expect(r.body.element).to.equal('sfdc');
    expect(r.body.oauthUrl).to.not.be.empty;
  });
};

const opts = { payload: common.genElement({}), schema: schema };

suite.forPlatform('elements', opts, (test) => {

  it('should support search', () => cloud.get('elements', listSchema));
  it('should support get keys', () => cloud.get('elements/keys', keysSchema));

  it('should support CRUD by key', () => {
    const name = 'Churros DB element ' + faker.random.number();
    return crudElement('key', common.genElement({name}), common.genElement({ description: "An updated Churros element", name }), schema);
  });
  it('should support CRUD by ID', () => {
    const name = 'Churros DB element ' + faker.random.number();
    return crudElement('id', common.genElement({name}), common.genElement({ description: "An updated Churros element", name }), schema);
  });
  it('should support CRUD by ID with objects', () => crudElement('id', common.genElementWithObjects({}), common.genElementWithObjects({ description: "An updated Churros element" }), schema));

  it('should support JDBC element CRUD by key', () => crudElement('key', common.genDBElement({}), common.genDBElement({ description: "An updated Churros DB element" }), schema));
  it('should support JDBC element CRUD by ID', () => crudElement('id', common.genDBElement({}), common.genDBElement({ description: "An updated Churros DB element" }), schema));

  it('should support export by key', () => cloud.get('elements/freshdesk/export', schema));
  it('should support export by ID', () => {
    return getElementId('freshdesk')
      .then(id => cloud.get('elements/' + id + '/export', schema));
  });

  it('should support counting instances by element key', () => {
    return cloud.get('/instances/count')
    .then(r => {
      expect(r.body.totalInstances).to.be.above(0);
      expect(r.body.elementInstances).to.not.be.empty;
    });
  });

  it('should support clone by key', () => {
    if (props.get('user') === 'system') {
      logger.warn('Unable to test element clone as system user. Skipping.');
      return;
    }
    let clone;
    return cloud.post('elements/freshdesk/clone', schema)
      .then(r => clone = r.body)
      .then(r => cloud.delete('elements/' + clone.key))
      .catch(e => {
        if (clone) cloud.delete('elements/' + clone.key);
        throw new Error(e);
      });
  });

  it('should support clone by ID', () => {
    if (props.get('user') === 'system') {
      logger.warn('Unable to test element clone as system user. Skipping.');
      return;
    }
    let clone;
    return getElementId('freshdesk')
      .then(id => cloud.post(`elements/${id}/clone`, schema))
      .then(r => {
        clone = r.body;
        expect(clone).to.not.be.empty;
        expect(clone.configuration).to.not.be.empty;
        //Loop through the configuration to make sure there is no default value for oauth.api.key
        clone.configuration.forEach(c => {
            if(c.key === 'oauth.api.key') {
              expect(c.defaultValue).to.be.empty;
            }
        });
      })
      .then(r => cloud.delete('elements/' + clone.id))
      .catch(e => {
        if (clone) cloud.delete('elements/' + clone.id);
        throw new Error(e);
      });
  });

  it('should support activate/deactivate by key', () => testElementActivation('key', schema));
  it('should support activate/deactivate by ID', () => testElementActivation('id', schema));

  it('should support oauth URL generation by key', () => {
    return testOAuthUrl('sfdc')
    .then(() => testOAuthUrlPost('sfdc'));
  });
  it('should support oauth URL generation by ID', () => {
    let elementId;
    return getElementId('sfdc')
      .then(id => elementId = id)
      .then(() => testOAuthUrl(elementId))
      .then(() => testOAuthUrlPost(elementId));
  });

  it('should support retrieve default transformations by key', () => cloud.get('elements/sfdc/transformations'));
  it('should support retrieve default transformations by ID', () => {
    return getElementId('sfdc')
      .then(id => cloud.get(`elements/${id}/transformations`));
  });

});
