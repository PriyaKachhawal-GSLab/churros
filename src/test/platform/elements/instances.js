'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const props = require('core/props');
const provisioner = require('core/provisioner');
const instanceSchema = require('./assets/element.instance.schema');
const instancesSchema = require('./assets/element.instances.schema');
const transformationPayload = require('./assets/accountTransformation');
const objDefPayload = require('./assets/accountObjectDefinition');
const sfdcSwaggerSchema = require('./assets/closeioSwagger.schema');
const defaults = require('core/defaults');
const logger = require('winston');

const genInstance = (element, o) => ({
  name: (o.name || 'churros-instance'),
  providerData: (o.providerData || undefined),
  element: { key: element },
  configuration: props.all(element)
});

const crudsInstance = (baseUrl) => {
  let id;
  return provisioner.create('jira', undefined, baseUrl)
    .then(r => id = r.body.id)
    .then(r => cloud.get(`${baseUrl}/${id}`, (r) => {
      expect(r).to.have.schemaAnd200(instanceSchema);
      expect(r.body.configuration).to.not.be.empty;
      expect(r.body.configuration.password).to.equal("********");
      expect(r.body.configuration.username).to.equal(props.getForKey('jira', 'username'));
    }))
    .then(r => cloud.get(`${baseUrl}`, instancesSchema))
    .then(r => expect(r.body.length).to.be.above(0))
    .then(r => cloud.put(`${baseUrl}/${id}`, genInstance('jira', { name: 'updated-instance' })))
    .then(r => provisioner.delete(id, baseUrl))
    .catch(e => {
      if (id) provisioner.delete(id, baseUrl);
      throw new Error(e);
    });
};

const updateInstanceWithReprovision = (baseUrl, schema) => {
  let id;
  let ids = [];
  return provisioner.create('closeio')
    .then(r => id = r.body.id)
    .then(r => ids.push(id))
    .then(r => cloud.get(`${baseUrl}/${id}`, (r) => {
      expect(r).to.have.schemaAnd200(schema);
      expect(r.body.configuration).to.not.be.empty;
      expect(r.body.configuration.username).to.equal(props.getForKey('closeio', 'username'));
    }))
    .then(r => provisioner.partialOauth('closeio'))
    .then(r => {
      ids.push(id + 1);
      return r;
    })
    .then(code =>
      cloud.put(`${baseUrl}/${id}`, genInstance('closeio', { name: 'updated-instance', providerData: { code: code } }), r => {
        expect(r.body.configuration).to.not.be.empty;
        expect(r.body.configuration.username).to.equal(props.getForKey('closeio', 'username'));
        expect(r.body).to.not.have.key('providerData');
      }))
    .then(code =>
      cloud.put(`${baseUrl}`, genInstance('closeio', { name: 'updated-instance', providerData: { code: code } }), r => {
        expect(r.body.configuration).to.not.be.empty;
        expect(r.body.configuration.username).to.equal(props.getForKey('closeio', 'username'));
        expect(r.body).to.not.have.key('providerData');
      }))
    .then(r => cloud.get(`/hubs/crm/accounts`))
    .then(r => expect(r.body).to.be.instanceof(Array))
    .then(r => provisioner.partialOauth('closeio'))
    .then(r => {
      ids.push(id + 2);
      return r;
    })
    .then(code => cloud.patch(`${baseUrl}/${id}`, { name: 'updated-instance', providerData: { code: code } }, r => {
      expect(r.body.configuration).to.not.be.empty;
      expect(r.body.configuration.username).to.equal(props.getForKey('closeio', 'username'));
      expect(r.body).to.not.have.key('providerData');
    }))
    .then(code => cloud.patch(`${baseUrl}`, { name: 'updated-instance', providerData: { code: code } }, r => {
      expect(r.body.configuration).to.not.be.empty;
      expect(r.body.configuration.username).to.equal(props.getForKey('closeio', 'username'));
      expect(r.body).to.not.have.key('providerData');
    }))
    .then(r => cloud.get(`/hubs/crm/accounts`))
    .then(r => expect(r.body).to.be.instanceof(Array))
    .then(r => Promise.all(ids.map(d => provisioner.delete(d, baseUrl))))
    .catch(e => {
      if (ids.length > 0) {
        return Promise.all(ids.map(d => provisioner.delete(d, baseUrl)))
        .catch(err => {}).then(() => { throw new Error(e); });
      } else {
        throw new Error(e);
      }
    });
};

const opts = { schema: instanceSchema };

suite.forPlatform('elements/instances', opts, (test) => {
  let closeioId, closeioInstance;
  before(() => {
    return provisioner.create('closeio')
      .then(r => {
        closeioInstance = r.body;
        closeioId = r.body.id;
      });
  });

  after(() => {
    return closeioId ? provisioner.delete(closeioId) : true;
  });

  it('should support using filter.response.nulls config to filter out or display nulls', () => {
    const validate = (r) => {
      expect(r.body.length).to.be.above(0);
      return r.body.filter(config => config.key === 'filter.response.nulls')[0];
    };

    const getOauthKey = (r, oauthKey) => {
      expect(r.body.length).to.be.above(0);
      return r.body.filter(config => config.key === oauthKey)[0];
    };

    const validateNullsPresent = (shouldHaveNulls) => {
      return cloud.get('hubs/crm/accounts?pageSize=1')
        .then(r => {
          let keys = Object.keys(r.body[0]);
          return keys.filter(key => r.body[0][key] === null);
        })
        .then(r => expect(r.length > 0).to.equal(shouldHaveNulls));
    };

    let configuration, sfdcId;

    return provisioner.create('sfdc')
      .then(r => {
        sfdcId = r.body.id;
        expect(r.body.configuration['oauth.api.key']).to.be.equal('********');
        expect(r.body.configuration['oauth.api.secret']).to.be.equal('********');
      })
      .then(() => cloud.get(`/instances/${sfdcId}/configuration`))
      .then(r => validate(r))
      .then(() => cloud.get(`/instances/configuration`))
      .then(r => {
        //Validate if the oauth.api.key value is returned
        let apiKeyConfig = getOauthKey(r, 'oauth.api.key');
        expect(apiKeyConfig.propertyValue).to.be.equal('********');
        expect(getOauthKey(r, 'oauth.api.secret').propertyValue).to.be.equal('********');
        configuration = validate(r);
        expect(configuration.propertyValue).to.equal('true');
      })
      .then(r => validateNullsPresent(false))
      .then(r => cloud.patch(`/instances/${sfdcId}/configuration/${configuration.id}`, Object.assign({}, configuration, { propertyValue: 'false' })))
      .then(r => cloud.patch(`/instances/configuration/${configuration.id}`, Object.assign({}, configuration, { propertyValue: 'false' })))
      .then(r => cloud.get(`/instances/${sfdcId}/configuration/${r.body.id}`))
      .then(r => cloud.get(`/instances/configuration/${r.body.id}`))
      .then(r => expect(r.body.propertyValue).to.equal('false'))
      .then(r => validateNullsPresent(true));
  });

  it('should support CRUD by key', () => crudsInstance('elements/jira/instances'));

  it('should support CRUD by ID', () => {
    return cloud.get('elements/jira')
      .then(r => crudsInstance(`elements/${r.body.id}/instances`));
  });

  it('should support search tags', () => {
    return cloud.withOptions({ qs: { 'tags[]': 'churros-instance' } }).get('instances')
      .then(r => {
        r.body.map(s => {
          expect(s.tags.includes('churros-instance')).to.equal(true);
        });
      });
  });

  it('should support searchText', () => {
    return cloud.withOptions({ qs: { 'searchText': 'churros' } }).get('instances')
      .then(r => {
        r.body.map(s => expect(s.name.includes('churros')).to.equal(true));
      });
  });

  it('should support searchText and tags', () => {
    return cloud.withOptions({ qs: { 'searchText': 'churros', 'tags[]': 'churros-instance' } })
      .get('instances')
      .then(r => {
        r.body.map(s => expect(s.name.includes('churros')).to.equal(true) &&
                        expect(s.tags.includes('churros-instance')).to.equal(true));
      });
  });

  it('should fail there are no instances matching search', () => {
    return cloud.withOptions({ qs: { 'searchText': 'somelongrandomstringwithnocolisions', 'tags[]': 'churros-instance' } })
      .get('instances', r => expect(r).to.have.statusCode(404));
  });

  it('should support update with reprovision by key', () => updateInstanceWithReprovision('/instances', instanceSchema));

  it('should support get instance specific docs', () => {
    return cloud.post(`instances/${closeioId}/objects/myaccounts/definitions`, objDefPayload)
      .then(r => cloud.post(`instances/${closeioId}/transformations/myaccounts`, transformationPayload))
      .then(r => cloud.get(`instances/${closeioId}/docs`, sfdcSwaggerSchema))
      .then(r => cloud.delete(`instances/${closeioId}/transformations/myaccounts`))
      .then(r => cloud.delete(`instances/${closeioId}/objects/myaccounts/definitions`));
  });

  it('should support get instance specific docs with out instance id', () => {
    defaults.token(closeioInstance.token);
    return cloud.post(`instances/objects/myaccounts/definitions`, objDefPayload)
      .then(r => cloud.post(`instances/transformations/myaccounts`, transformationPayload))
      .then(r => cloud.get(`instances/docs`, sfdcSwaggerSchema));
  });

  it('should support updating the configuration for an element instance', () => {
    const validate = (r) => {
      expect(r.body.length).to.be.above(0);
      return r.body.filter(config => config.key === 'event.notification.enabled')[0];
    };

    return cloud.get(`/instances/${closeioId}/configuration`)
      .then(r => validate(r))
      .then(configuration => cloud.patch(`/instances/${closeioId}/configuration/${configuration.id}`, Object.assign({}, configuration, { propertyValue: 'true' })))
      .then(r => cloud.get(`/instances/${closeioId}/configuration/${r.body.id}`))
      .then(r => expect(r.body.propertyValue).to.equal('true'));
  });


  it('should support updating the configuration for an element instance with out instance id', () => {
    const validate = (r) => {
      expect(r.body.length).to.be.above(0);
      return r.body.filter(config => config.key === 'event.notification.enabled')[0];
    };

    return cloud.get(`/instances/configuration`)
      .then(r => validate(r))
      .then(configuration => cloud.patch(`/instances/configuration/${configuration.id}`, Object.assign({}, configuration, { propertyValue: 'true' })))
      .then(r => cloud.get(`/instances/configuration/${r.body.id}`))
      .then(r => expect(r.body.propertyValue).to.equal('true'));
  });

  it('should support updating the tags for an element instance', () => {
    const validateTags = (id, tags) => {
      expect(tags.length).to.equal(1) && expect(tags[0]).to.equal('churros-testing');
    };

    let id;
    return provisioner.create('closeio', { name: 'churros-test' })
      .then(r => id = r.body.id)
      .then(r => cloud.patch(`/instances/${id}`, { id: id, tags: ['churros-testing'] }))
      .then(r => cloud.patch(`/instances`, { id: id, tags: ['churros-testing'] }))
      .then(r => cloud.get(`/instances/${id}`, validateTags(id, r.body.tags)))
      .then(r => provisioner.delete(id));
  });

  it('should support switching an instance to the clone of an element', () => {
    if (props.get('user') === 'system') {
      logger.warn('Unable to test element clone as system user. Skipping.');
      return;
    }
    let instance, clone;
    return provisioner.create('closeio')
      .then(r => instance = r.body)
      .then(r => cloud.post('elements/closeio/clone').catch(r => cloud.get('elements/closeio')))
      .then(r => clone = r.body)
      .then(r => cloud.patch(`instances/${instance.id}`, { element: { id: clone.id } })
        .then(r => {
          expect(r.body.element.id).to.equal(clone.id);
        }))
      .then(r => provisioner.delete(instance.id, '/instances'))
      .then(r => cloud.delete(`elements/${clone.key}`))
      .catch(e => {
        if (instance && clone) {
          provisioner.delete(instance.id, 'elements/shopify/instances');
          cloud.delete(`elements/${clone.key}`);
        }
        throw new Error(e);
      });
  });

  it('should sanitize element instance name on create and update', () => {
    let id;
    return provisioner.create('closeio', { name: '<a href="#" onClick="javascript:alert(\'xss\');return false;">churros-xss</a>' })
      .then(r => id = r.body.id)
      .then(() => cloud.get(`/instances/${id}`))
      .then(r => expect(r.body.name).to.equal('churros-xss'))
      .then(() => cloud.patch(`/instances/${id}`, { name: '<a href="#" onClick="javascript:alert(\'xss\');return false;">churros-xss-updated</a>' }))
      .then(r => expect(r.body.name).to.equal('churros-xss-updated'))
      .then(() => cloud.patch(`/instances`, { name: '<a href="#" onClick="javascript:alert(\'xss\');return false;">churros-xsss-updated</a>' }))
      .then(r => expect(r.body.name).to.equal('churros-xsss-updated'))
      .then(() => provisioner.delete(id))
      .catch(e => {
        if (id) provisioner.delete(id);
        throw new Error(e);
      });
  });

  it('should sanitize element instance tags on create and update', () => {
    let id;
    return provisioner.create('closeio', { name: '<a href="#" onClick="javascript:alert(\'xss\');return false;">@churros-xss</a>' })
      .then(r => id = r.body.id)
      .then(() => cloud.get(`/instances/${id}`))
      .then(r => expect(r.body.name).to.equal('@churros-xss') && expect(r.body.tags[0]).to.equal('@churros-xss'))
      .then(() => cloud.patch(`/instances/${id}`, { name: '<a href="#" onClick="javascript:alert(\'xss\');return false;">@churros-xss-updated</a>' }))
      .then(r => expect(r.body.name).to.equal('@churros-xss-updated'))
      .then(() => provisioner.delete(id))
      .catch(e => {
        if (id) provisioner.delete(id);
        throw new Error(e);
      });
  });

  it('should fail with 401 for deleted instance api call', () => {
    let instanceId;
    return provisioner.create('closeio')
      .then(r => instanceId = r.body.id)
      .then(() => provisioner.delete(instanceId))
      .then(() => cloud.get('hubs/crm/account?pageSize=1', (r) => expect(r).to.have.statusCode(401)));
  });

  it('should ignore any provided hub', () => {
    let withCorrectHub;
    defaults.token(closeioInstance.token);
    return cloud.get('hubs/crm/accounts?pageSize=1')
      .then(r => withCorrectHub = r.body)
      .then(() => cloud.get('hubs/documents/accounts?pageSize=1'))
      .then(r => expect(r.body).to.deep.equal(withCorrectHub))
      .then(() => cloud.get('hubs/crap/accounts?pageSize=1'))
      .then(r => expect(r.body).to.deep.equal(withCorrectHub))
      .then(() => cloud.get('accounts?pageSize=1'))
      .then(r => expect(r.body).to.deep.equal(withCorrectHub));
  });

  it('should return element-instance-id on headers', () => {
    let instanceId;
    return provisioner.create('jira')
      .then(r => instanceId = r.body.id)
      .then(() => cloud.get(`/incidents`))
      .then(r => expect(parseInt(r.response.headers['elements-element-instance-id'])).to.equal(instanceId));
  });

  it('should allow disabling and enabling  an instance', () => {
    let instanceId;
    defaults.token(closeioInstance.token);
    return provisioner.create('jira')
      .then(r => instanceId = r.body.id)
      .then(() => cloud.delete(`instances/${instanceId}/enabled`))
      .then(() => cloud.get(`/incidents`, r => expect(r).to.have.statusCode(403)))
      .then(() => cloud.get(`/objects`))
      .then(() =>cloud.put(`instances/${instanceId}/enabled`))
      .then(() => cloud.get(`/incidents`))
      .then(() => provisioner.delete(instanceId));
  });
});
