'use strict';

const expect = require('chakram').expect;
const R = require('ramda');
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const provisioner = require('core/provisioner');
const defaults = require('core/defaults');
const schema = require('./assets/transformation.schema');
const objDefSchema = require('./assets/objectDefinition.schema');
const noFields = tools.requirePayload(`${__dirname}/assets/nofield-definition.json`);
const noFields2 = tools.requirePayload(`${__dirname}/assets/nofield-definition.json`);
const arrayDefinition = require('./assets/definition-with-array.json');
const arrayTransformation = tools.requirePayload(`${__dirname}/assets/transformation-array.json`);

const getConfig = (type, from, to) => ({
  type: type,
  properties: {
    fromVendor: from,
    toVendor: to
  }
});

const getObjDefField = (path, type) => ({ path: path, type: type });

const addObjDefField = (objDef, path, type) => objDef.fields.push(getObjDefField(path, type));

const genBaseObjectDef = (opts) => ({
  fields: (opts.fields) || [{
    path: 'churrosId',
    type: 'number'
  }]
});

const genDefaultObjectDef = (opts) => {
  let objDef = genBaseObjectDef(opts);
  addObjDefField(objDef, 'churrosName', 'string');
  addObjDefField(objDef, 'churrosMod', 'string');
  return objDef;
};

const getTransField = (path, type, vendorPath, vendorType, configuration) => ({ path: path, type: type, vendorPath: vendorPath, vendorType: vendorType, configuration: configuration });

const addTransField = (trans, path, type, vendorPath, vendorType, configuration) => trans.fields.push(getTransField(path, type, vendorPath, vendorType, configuration));

const genBaseTrans = (opts) => ({
  vendorName: (opts.vendorName || 'Account'),
  configuration: (opts.configuration || null),
  fields: (opts.fields) || [{
    path: 'churrosId',
    type: 'number',
    vendorPath: 'Id',
    vendorType: 'string'
  }]
});

const genDefaultTrans = (opts) => {
  let trans = genBaseTrans(opts);
  addTransField(trans, 'churrosName', 'string', 'Name', 'string');
  addTransField(trans, 'churrosMod', 'string', 'LastModifiedDate', 'string');
  return trans;
};

const genTransWithRemove = (opts) => {
  let trans = genBaseTrans(opts);
  addTransField(trans, 'churrosName', 'string', 'Name', 'string');
  addTransField(trans, 'churrosMod', 'string', 'LastModifiedDate', 'string', [{
    type: 'remove',
    properties: {
      fromVendor: true,
      toVendor: true
    }
  }]);
  return trans;
};

const genTransWithPassThrough = (opts) => {
  let trans = genBaseTrans(opts);
  addTransField(trans, 'churrosName', 'string', 'Name', 'string');
  addTransField(trans, 'churrosMod', 'string', 'LastModifiedDate', 'string', [{
    type: 'passThrough',
    properties: {
      fromVendor: false,
      toVendor: false
    }
  }]);
  return trans;
};

const crud = (url, payload, updatePayload, schema) => {
  return cloud.post(url, payload, schema)
    .then(r => cloud.get(url, schema))
    .then(r => cloud.put(url, updatePayload, schema))
    .then(r => cloud.get(url, schema))
    .then(r => cloud.delete(url))
    .catch(e => {
      cloud.delete(url);
      throw new Error(e);
    });
};

const getObjectDefUrl = (level, objectName) => {
  return level + '/objects/' + objectName + '/definitions';
};

const getTransformUrl = (level, objectName, elementKey) => {
  let url = (elementKey !== undefined) ? level + '/elements/' + elementKey : level;
  return url + '/transformations/' + objectName;
};

const crudObjectDefsByName = (level, payload, updatePayload, schema) => {
  let objectName = 'churros-object-' + tools.random();
  return crud(getObjectDefUrl(level, objectName), payload, updatePayload, schema);
};

const crudTransformsByName = (level, elementKey, payload, updatePayload, schema) => {
  let objectName = 'churros-object-' + tools.random();
  return cloud.post(getObjectDefUrl(level, objectName), genDefaultObjectDef({}))
    .then(r => crud(getTransformUrl(level, objectName, elementKey), payload, updatePayload, schema))
    .then(r => cloud.delete(getObjectDefUrl(level, objectName)))
    .catch(e => {
      cloud.delete(getObjectDefUrl(level, objectName));
      throw new Error(e);
    });
};

const testTransformationForInstance = (objectName, objDefUrl, transUrl) => {
  return cloud.post(objDefUrl, genDefaultObjectDef({}))
    // test normal transformation
    .then(r => cloud.post(transUrl, genDefaultTrans({})))
    .then(r => cloud.get('hubs/crm/' + objectName, r => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.not.be.empty;
      r.body.forEach(item => {
        expect(item.churrosId).to.not.be.empty;
        expect(item.churrosName).to.not.be.empty;
        expect(item.churrosMod).to.not.be.empty;
      });
    }))
    // test remove config
    .then(r => cloud.put(transUrl, genTransWithRemove({})))
    .then(r => cloud.get('hubs/crm/' + objectName, r => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.not.be.empty;
      r.body.forEach(item => {
        expect(item.churrosMod).to.be.empty;
      });
    }))
    // test passThrough config
    .then(r => cloud.put(transUrl, genTransWithPassThrough({})))
    .then(r => cloud.get('hubs/crm/' + objectName, r => {
      expect(r).to.have.statusCode(200);
      expect(r.body).to.not.be.empty;
      r.body.forEach(item => {
        expect(item.churrosMod).to.be.empty;
      });
    }))
    .then(r => cloud.delete(transUrl))
    .then(r => cloud.delete(objDefUrl))
    .catch(e => {
      cloud.delete(transUrl);
      cloud.delete(objDefUrl);
      throw new Error(e);
    });
};

const testTransformation = (instanceId, objectName, objDefUrl, transUrl) => testTransformationForInstance(objectName, objDefUrl, transUrl);

suite.forPlatform('transformations', { schema: schema }, (test) => {
  /** before - provision element to use throughout */
  const elementKey = 'sfdc';
  let sfdcId, elementId, maximizerId;
  before(() => provisioner.create(elementKey)
    .then(r => {
      sfdcId = r.body.id;
      elementId = r.body.element.id;
    })
  .then(() => provisioner.create('maximizer'))
  .then(r => {
    maximizerId = r.body.id;
    arrayTransformation.elementInstanceId = maximizerId;
  }));

  /** after - clean up element */
  after(() => provisioner.delete(sfdcId)
    .catch(() => {})
    .then(() => provisioner.delete(maximizerId)));

  /** org-level */
  it('should support org-level object definition CRUD by name', () => crudObjectDefsByName('organizations', genDefaultObjectDef({}), genDefaultObjectDef({}), objDefSchema));
  it('should support org-level transformation CRUD by name and element key', () => crudTransformsByName('organizations', elementKey, genDefaultTrans({}), genDefaultTrans({}), schema));
  it('should support org-level transformation CRUD by name and element ID', () => crudTransformsByName('organizations', elementId, genDefaultTrans({}), genDefaultTrans({}), schema));
  it('should support org-level transformations', () => {
    let objectName = 'churros-object-' + tools.random();
    return testTransformation(sfdcId, objectName, getObjectDefUrl('organizations', objectName), getTransformUrl('organizations', objectName, elementKey));
  });

  /** account-level */
  const getPlatformAccounts = () => {
     const secrets = defaults.secrets();
     const headers = {
       Authorization: `User ${secrets.userSecret}, Organization ${secrets.orgSecret}`
     };
     return cloud.withOptions({ headers }).get("accounts");
  };

  it('should support default account-level object definition CRUD by name', () => crudObjectDefsByName('accounts', genDefaultObjectDef({}), genDefaultObjectDef({}), objDefSchema));
  it('should support account-level object definition CRUD by name', () => {
    let accountId;
    return getPlatformAccounts()
      .then(r => r.body.forEach(account => accountId = (account.defaultAccount) ? accountId = account.id : accountId))
      .then(r => crudObjectDefsByName('accounts/' + accountId, genDefaultObjectDef({}), genDefaultObjectDef({}), objDefSchema));
  });
  it('should support account-level transformation CRUD by name and element key', () => {
    let accountId;
    return getPlatformAccounts()
      .then(r => r.body.forEach(account => accountId = (account.defaultAccount) ? accountId = account.id : accountId))
      .then(r => crudTransformsByName('accounts/' + accountId, elementKey, genDefaultTrans({}), genDefaultTrans({}), schema));
  });
  it('should support account-level transformation CRUD by name and element ID', () => {
    let accountId;
    return getPlatformAccounts()
      .then(r => r.body.forEach(account => accountId = (account.defaultAccount) ? accountId = account.id : accountId))
      .then(r => crudTransformsByName('accounts/' + accountId, elementId, genDefaultTrans({}), genDefaultTrans({}), schema));
  });
  it('should support account-level transformations', () => {
    let objectName = 'churros-object-' + tools.random();
    let accountId, level;
    return getPlatformAccounts()
      .then(r => r.body.forEach(account => accountId = (account.defaultAccount) ? accountId = account.id : accountId))
      .then(r => level = 'accounts/' + accountId)
      .then(r => testTransformation(sfdcId, objectName, getObjectDefUrl(level, objectName), getTransformUrl(level, objectName, elementKey)));
  });

  /** instance-level */
  it('should support instance-level object definition CRUD by name', () => {
    return crudObjectDefsByName(`instances/${sfdcId}`, genDefaultObjectDef({}), genDefaultObjectDef({}), objDefSchema);
  });
  it('should support instance-level transformation CRUD by name', () => {
    return crudTransformsByName(`instances/${sfdcId}`, undefined, genDefaultTrans({}), genDefaultTrans({}), schema);
  });
  it('should support instance-level transformations', () => {
    let objectName = 'churros-object-' + tools.random();
    let level = `instances/${sfdcId}`;
    return testTransformationForInstance(objectName, getObjectDefUrl(level, objectName), getTransformUrl(level, objectName));
  });

  it('should support transformation inheritance', () => {
    let objectName = 'churros-object-' + tools.random();
    let accountId;
    return cloud.post(getObjectDefUrl('organizations', objectName), genBaseObjectDef({}))
      .then(r => cloud.post(getTransformUrl('organizations', objectName, elementKey), genBaseTrans({})))
      .then(r => cloud.get(`hubs/crm/${objectName}`, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.null;
        r.body.forEach(item => {
          expect(item.churrosId).to.not.be.empty;
          expect(item.churrosName).to.be.undefined;
          expect(item.churrosMod).to.be.undefined;
        });
      }))
      // create account-level obj def and trans for name field
      .then(r => getPlatformAccounts())
      .then(r => r.body.forEach(account => accountId = (account.defaultAccount) ? accountId = account.id : accountId))
      .then(r => {
        let objDef = genBaseObjectDef({ fields: [getObjDefField('churrosName', 'string')] });
        return cloud.post(getObjectDefUrl('accounts/' + accountId, objectName), objDef);
      })
      .then(r => {
        let trans = genBaseTrans({ fields: [getTransField('churrosName', 'string', 'Name', 'string')], configuration: [getConfig('inherit', true, true)] });
        return cloud.post(getTransformUrl('accounts/' + accountId, objectName, elementKey), trans);
      })
      .then(r => cloud.get(`accounts/${accountId}/elements/${elementKey}/transformations/${objectName}`, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.null;
        let foundId = false,
          foundName = false;
        r.body.fields.forEach(field => {
          foundId = foundId || (field.path === 'churrosId');
          foundName = foundName || (field.path === 'churrosName');
        });
        expect(foundId);
        expect(foundName);
      }))
      .then(r => cloud.get('hubs/crm/' + objectName, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.null;
        r.body.forEach(item => {
          expect(item.churrosId).to.not.be.empty;
          expect(item.churrosName).to.not.be.empty;
          expect(item.churrosMod).to.be.undefined;
        });
      }))
      // create instance-level obj def and trans for mod field
      .then(r => {
        let objDef = genBaseObjectDef({ fields: [getObjDefField('churrosMod', 'string')] });
        return cloud.post(getObjectDefUrl('instances/' + sfdcId, objectName), objDef);
      })
      .then(r => {
        let trans = genBaseTrans({ fields: [getTransField('churrosMod', 'string', 'LastModifiedDate', 'string')], configuration: [getConfig('inherit', true, true)] });
        return cloud.post(getTransformUrl('instances/' + sfdcId, objectName), trans);
      })
      .then(r => cloud.get(`instances/${sfdcId}/transformations/${objectName}`, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.null;
        let foundId = false,
          foundName = false,
          foundMod = false;
        r.body.fields.forEach(field => {
          foundId = foundId || (field.path === 'churrosId');
          foundName = foundName || (field.path === 'churrosName');
          foundMod = foundMod || (field.path === 'churrosMod');
        });
        expect(foundId);
        expect(foundName);
        expect(foundMod);
      }))
      .then(r => cloud.get('hubs/crm/' + objectName, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.null;
        r.body.forEach(item => {
          expect(item.churrosId).to.not.be.empty;
          expect(item.churrosName).to.not.be.empty;
          expect(item.churrosMod).to.not.be.empty;
        });
      }))
      // clean up!
      .then(r => cloud.delete(getTransformUrl('instances/' + sfdcId, objectName)))
      .then(r => cloud.delete(getObjectDefUrl('instances/' + sfdcId, objectName)))
      .then(r => cloud.delete(getTransformUrl('accounts/' + accountId, objectName, elementKey)))
      .then(r => cloud.delete(getObjectDefUrl('accounts/' + accountId, objectName)))
      .then(r => cloud.delete(getTransformUrl('organizations', objectName, elementKey)))
      .then(r => cloud.delete(getObjectDefUrl('organizations', objectName)))
      //clean up if there is a failure
      .catch(e => {
        if (sfdcId && objectName && accountId && elementKey) {
          cloud.delete(getTransformUrl('instances/' + sfdcId, objectName));
          cloud.delete(getObjectDefUrl('instances/' + sfdcId, objectName));
          cloud.delete(getTransformUrl('accounts/' + accountId, objectName, elementKey));
          cloud.delete(getObjectDefUrl('accounts/' + accountId, objectName));
          cloud.delete(getTransformUrl('organizations', objectName, elementKey));
          cloud.delete(getObjectDefUrl('organizations', objectName));
        }
        throw new Error(e);
      });
  });
  it('should support creating JS only transformation in v2', () => {
    const noFieldV2Payload = {
      "level":"instance",
      "fields":[],
      "configuration":[],
      "script":{"body":"console.log('Hey there')"},
      "objectName": noFields.name,
      "vendorName":"Lead",
      "elementInstanceId": sfdcId
    };

    return cloud.put('/common-resources', noFields)
      .then(r => cloud.post(`/instances/${sfdcId}/transformations/${noFields.name}`, {vendorName: "Lead"}))
      .then(r => cloud.put('/transformations', noFieldV2Payload))
      .then(r => cloud.delete(`/instances/${sfdcId}/transformations/${noFields.name}`))
      .then(r => cloud.delete(`/common-resources/${noFields.name}`).catch(r => {}));
  });

  it('should support renaming object defintions and transformations at the org level', ()=> {
    let objectName = 'churros-object-' + tools.random();
    let newObjectName = 'churros-renamed-' + tools.random();
    const renamePayload = {
      "objectName": `${newObjectName}`
    };
    return cloud.post(getObjectDefUrl('organizations',objectName), genBaseObjectDef({}))
      .then(r => cloud.post(getTransformUrl('organizations', objectName, elementKey), genBaseTrans({})))
      .then(r=> cloud.patch(`/organizations/objects/${objectName}`, renamePayload))
      .then(r=> cloud.get(getObjectDefUrl('organizations',newObjectName)))
      .then(r=> cloud.get(getTransformUrl('organizations', newObjectName, elementKey)))
      .then(r => cloud.delete(getTransformUrl('organizations', newObjectName, elementKey)))
      .then(r => cloud.delete(getObjectDefUrl('organizations', newObjectName)));
  });

  it('should support renaming object defintions and transformations at the account level', ()=> {
    let objectName = 'churros-object-' + tools.random();
    let newObjectName = 'churros-renamed-' + tools.random();
    const renamePayload = {
      "objectName": `${newObjectName}`
    };
    let accountId;
    return getPlatformAccounts()
      .then(r => r.body.forEach(account => accountId = (account.defaultAccount) ? accountId = account.id : accountId))
      .then(r => cloud.post(getObjectDefUrl('accounts/' + accountId,objectName), genBaseObjectDef({})))
      .then(r => cloud.post(getTransformUrl('accounts/' + accountId, objectName, elementKey), genBaseTrans({})))
      .then(r=> cloud.patch(`accounts/${accountId}/objects/${objectName}`, renamePayload))
      .then(r=> cloud.get(getObjectDefUrl('accounts/' + accountId,newObjectName)))
      .then(r=> cloud.get(getTransformUrl('accounts/' + accountId, newObjectName, elementKey)))
      .then(r => cloud.delete(getTransformUrl('accounts/' + accountId, newObjectName, elementKey)))
      .then(r => cloud.delete(getObjectDefUrl('accounts/' + accountId, newObjectName)));
  });

  it('should support renaming object defintions and transformations at the instance level', ()=> {
    let objectName = 'churros-object-' + tools.random();
    let newObjectName = 'churros-renamed-' + tools.random();
    const renamePayload = {
      "objectName": `${newObjectName}`
    };

    return cloud.post(getObjectDefUrl('instances/' + sfdcId,objectName), genBaseObjectDef({}))
      .then(r => cloud.post(`instances/${sfdcId}/transformations/${objectName}`, genBaseTrans({})))
      .then(r=> cloud.patch(`instances/${sfdcId}/objects/${objectName}`, renamePayload))
      .then(r=> cloud.get(getObjectDefUrl('instances/' + sfdcId, newObjectName)))
      .then(r=> cloud.get(`instances/${sfdcId}/transformations/${newObjectName}`))
      .then(r => cloud.delete(`instances/${sfdcId}/transformations/${newObjectName}`))
      .then(r => cloud.delete(getObjectDefUrl('instances/' + sfdcId, newObjectName)));
  });

  it('should return a list of mapped element ids when retrieving common-resources', () => {
    let crName;
    const simpleTransform  = {
      "level":"account",
      "fields":[],
      "configuration":[],
      "script":{"body":"console.log('Hey there')"},
      "objectName": noFields2.name,
      "vendorName":"Lead",
      "elementInstanceId": sfdcId
    };

    const validator = r => {
      expect(r.body.mappedElementIds).to.have.length(3);
    };

    return cloud.put('/common-resources', noFields2)
      .then(r => crName = r.body.name)
      .then(r => cloud.post(getTransformUrl('organizations', noFields2.name, 'sfdc'), simpleTransform))
      .then(r => cloud.post(getTransformUrl('organizations', noFields2.name, 'closeio'), simpleTransform))
      .then(r => cloud.post(getTransformUrl('organizations', noFields2.name, 'zohocrm'), simpleTransform))
      .then(r => cloud.get(`/common-resources/${noFields2.name}`, validator))
      .then(r => cloud.delete(getTransformUrl('organizations', noFields2.name, 'sfdc')))
      .then(r => cloud.delete(getTransformUrl('organizations', noFields2.name, 'closeio')))
      .then(r => cloud.delete(getTransformUrl('organizations', noFields2.name, 'zohocrm')))
      .then(r => cloud.delete(`/common-resources/${noFields2.name}`).catch(r => {}));
  });

  it('should allow try it out functionality by org level', () => {
    let objectName = 'churros-object-' + tools.random();

    let objDefUrl = getObjectDefUrl('organizations', objectName);
    let transUrl = getTransformUrl('organizations', objectName, elementKey);
    let payload = {
      payload: {
        "Id": "123",
        "Name": "is it name?",
        "LastModifiedDate": "mods bro"
      },
      elementId
    };

    return cloud.post(objDefUrl, genDefaultObjectDef({}))
      // test normal transformation
      .then(r => cloud.post(transUrl, genDefaultTrans({})))
      .then(r => cloud.post(`/transformations/${objectName}/execute`, payload, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.churrosId).to.not.be.empty;
        expect(r.body.churrosName).to.not.be.empty;
        expect(r.body.churrosMod).to.not.be.empty;
      }))
      // test remove config
      .then(r => cloud.put(transUrl, genTransWithRemove({})))
      .then(r => cloud.post(`/transformations/${objectName}/execute`, payload, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.churrosMod).to.be.empty;
      }))
      // test passThrough config
      .then(r => cloud.put(transUrl, genTransWithPassThrough({})))
      .then(r => cloud.post(`/transformations/${objectName}/execute`, payload, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.churrosMod).to.be.empty;
      }))
      .then(r => cloud.delete(transUrl))
      .then(r => cloud.delete(objDefUrl))
      .catch(e => {
        cloud.delete(transUrl);
        cloud.delete(objDefUrl);
        throw new Error(e);
      });
  });

  it('should allow try it out functionality by instance level', () => {
    let objectName = 'churros-object-' + tools.random();

    let objDefUrl = `/instances/${sfdcId}/objects/${objectName}/definitions`;
    let transUrl = `/instances/${sfdcId}/transformations/${objectName}`;
    let payload = {
      payload: {
        "Id": "123",
        "Name": "is it name?",
        "LastModifiedDate": "mods bro"
      },
      instanceId: sfdcId
    };
    let postPayload = {
      payload: {
        churrosId: 'someIdzzz',
        churrosName: 'otherName',
        churrosMod: 'yup'
      },
      instanceId: sfdcId,
      method: 'POST'
    };

    return cloud.post(objDefUrl, genDefaultObjectDef({}))
      // test normal transformation
      .then(r => cloud.post(transUrl, genDefaultTrans({})))
      .then(r => cloud.post(`/transformations/${objectName}/execute`, payload, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.churrosId).to.not.be.empty;
        expect(r.body.churrosName).to.not.be.empty;
        expect(r.body.churrosMod).to.not.be.empty;
      }))
      // test POST
      .then(r => cloud.post(`/transformations/${objectName}/execute`, postPayload, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.Id).to.not.be.empty;
        expect(r.body.Name).to.not.be.empty;
        expect(r.body.LastModifiedDate).to.not.be.empty;
      }))
      // test remove config
      .then(r => cloud.put(transUrl, genTransWithRemove({})))
      .then(r => cloud.post(`/transformations/${objectName}/execute`, payload, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.churrosMod).to.be.empty;
      }))
      // test passThrough config
      .then(r => cloud.put(transUrl, genTransWithPassThrough({})))
      .then(r => cloud.post(`/transformations/${objectName}/execute`, payload, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.churrosMod).to.be.empty;
      }))
      .then(r => cloud.delete(transUrl))
      .then(r => cloud.delete(objDefUrl))
      .catch(e => {
        cloud.delete(transUrl);
        cloud.delete(objDefUrl);
        throw new Error(e);
      });
  });
  it('should allow try it out functionality with script', () => {
    let objectName = 'churros-object-' + tools.random();

    let objDefUrl = getObjectDefUrl('organizations', objectName);
    let transUrl = getTransformUrl('organizations', objectName, elementKey);
    let transWithScript = Object.assign({}, genDefaultTrans({}), {script: {body: 'done(Object.assign(transformedObject, {churrosScript: "script"}))'}});
    let payload = {
      payload: {
        "Id": "123",
        "Name": "is it name?",
        "LastModifiedDate": "mods bro"
      },
      elementId
    };

    return cloud.post(objDefUrl, genDefaultObjectDef({}))
      // test normal transformation
      .then(r => cloud.post(transUrl, transWithScript))
      .then(r => cloud.post(`/transformations/${objectName}/execute`, payload, r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.churrosId).to.not.be.empty;
        expect(r.body.churrosName).to.not.be.empty;
        expect(r.body.churrosMod).to.not.be.empty;
        expect(r.body.churrosScript).to.not.be.empty;
      }))
      .then(r => cloud.delete(transUrl))
      .then(r => cloud.delete(objDefUrl))
      .catch(e => {
        cloud.delete(transUrl);
        cloud.delete(objDefUrl);
        throw new Error(e);
      });
  });

  it('should support instance allow nulls and remove unmapped fields on vdr', () => {
    let config;
    const objectName = 'churros-object-' + tools.random();
    const transPayload =  genDefaultTrans({configuration: [{type: "passThrough", properties: {fromVendor: false, toVendor: false}}]});
    const objDefUrl = getObjectDefUrl('organizations', objectName);
    const transUrl = getTransformUrl('organizations', objectName, elementKey);
    return cloud.get(`/instances/${sfdcId}/configuration`)
      .then(r => config = R.find(R.propEq('key', 'filter.response.nulls'))(r.body))
      .then(() => cloud.patch(`/instances/${sfdcId}/configuration/${config.id}`, Object.assign({}, config, { propertyValue: 'false' })))
      .then(() => cloud.get(`/instances/${sfdcId}/configuration/${config.id}`, r => expect(r.body.propertyValue).to.equal('false')))
      .then(() => cloud.post(objDefUrl, genDefaultObjectDef({})))
      .then(r => cloud.post(transUrl, transPayload))
      .then(r => cloud.get('hubs/crm/' + objectName))
      .then(r => {
        expect(r).to.have.statusCode(200);
        expect(r.body).to.not.be.empty;
        r.body.forEach(item => {
          expect(item.churrosId).to.not.be.empty;
          expect(item.churrosName).to.not.be.empty;
          expect(item.churrosMod).to.not.be.empty;
        });
        const keys = Object.keys(r.body[0]);
        return keys.filter(key => r.body[0][key] === null);
      })
      .then(r => expect(r.length > 0).to.equal(false))
      // clean up
      .then(() => cloud.patch(`/instances/${sfdcId}/configuration/${config.id}`, Object.assign({}, config, { propertyValue: 'true' })))
      .then(() => cloud.delete(transUrl))
      .then(() => cloud.delete(objDefUrl));
  });
  it('should support mapping to arrays', () => {
    const objName = arrayTransformation.objectName;
    const transformationCreatedValidator = (r) => {
      expect(r).to.have.statusCode(200);
      return r;
    };
    const validatorWrapper = r => {
      expect(r.body.length).to.be.above(0);
      expect(r.body[0]).to.have.property('users');
      expect(r.body[0]).to.have.property('anotherUser');
      expect(r.body[0].users).to.be.array;
      expect(r.body[0].users.length).to.be.above(0);
      expect(r.body[0].users[0]).to.have.property('displayNamez');
    };

    return cloud.delete(`/instances/${maximizerId}/objects/${objName}/definitions`).catch(() => {})
      .then(r => cloud.post(`/instances/${maximizerId}/objects/${objName}/definitions`, arrayDefinition))
      .then(r => cloud.get(`/instances/${maximizerId}/objects/${objName}/definitions`))
      .then(r => cloud.delete(`/instances/${maximizerId}/transformations/${objName}`).catch(() => {}))
      .then(r => cloud.put(`/transformations`, arrayTransformation, (r) => transformationCreatedValidator(r)))
      .then(r => cloud.get(`/hubs/crm/${objName}`, validatorWrapper))
      .then(r => cloud.delete(`/instances/${maximizerId}/transformations/${objName}?propagate=true`).catch(() => {}))
      .then(r => cloud.delete(`/common-resources/${objName}`).catch(() => {}));
  });
});
