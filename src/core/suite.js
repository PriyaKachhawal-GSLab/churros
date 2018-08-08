/**
 * The core/suite module kicks off any test suite for an element or a platform resource.  This provides many convenience
 * functions under the `test` Object that it hands back to you.
 * @module core/suite
 */
'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');
const tools = require('core/tools');
const props = require('core/props');
const defaults = require('core/defaults');
const provisioner = require('core/provisioner');
const logger = require('winston');
const request = require('request');
const fs = require('fs');
const argv = require('optimist').argv;
const faker = require('faker');


var exports = module.exports = {};

const boomGoesTheDynamite = (name, testCb, skip) => {
  skip ?
    it.skip(name, testCb) :
    it(name, testCb);
};

const itPost = (name, api, payload, options, validationCb) => {
  const n = name || `should allow POST for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).post(api, payload, validationCb), options ? options.skip : false);
};

const itGet = (name, api, options, validationCb) => {
  const n = name || `should allow GET for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).get(api, validationCb), options ? options.skip : false);
};

const itCrd = (name, api, payload, validationCb, options) => {
  const n = name || `should allow CRD for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).crd(api, payload, validationCb), options ? options.skip : false);
};

const itCd = (name, api, payload, validationCb, options) => {
  const n = name || `should allow CD for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).cd(api, payload, validationCb), options ? options.skip : false);
};

const itCrds = (name, api, payload, validationCb, options) => {
  const n = name || `should allow CRDS for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).crds(api, payload, validationCb), options ? options.skip : false);
};

const itCrud = (name, api, payload, validationCb, updateCb, options) => {
  const n = name || `should allow CRUD for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).crud(api, payload, validationCb, updateCb), options ? options.skip : false);
};

const itCruds = (name, api, payload, validationCb, updateCb, options) => {
  const n = name || `should allow CRUDS for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).cruds(api, payload, validationCb, updateCb), options ? options.skip : false);
};

const itCrus = (name, api, payload, validationCb, updateCb, options) => {
  const n = name || `should allow CRUS for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).crus(api, payload, validationCb, updateCb), options ? options.skip : false);
};

const itSr = (name, api, validationCb, options) => {
  const n = name || `should allow SR for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).get(api).then(r => cloud.get(api + '/' + r.body[0].id)), options ? options.skip : false);
};

const itS = (name, api, validationCb, options) => {
  const n = name || `should allow S for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).get(api), options ? options.skip : false);
};

const itCrs = (name, api, payload, validationCb, options) => {
  const n = name || `should allow CRS for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).crs(api, payload, validationCb), options ? options.skip : false);
};

const itCr = (name, api, payload, validationCb, options) => {
  const n = name || `should allow CR for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).cr(api, payload, validationCb), options ? options.skip : false);
};

const itCs = (name, api, payload, validationCb, options) => {
  const n = name || `should allow CS for ${api}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).cs(api, payload, validationCb), options ? options.skip : false);
};

const itPagination = (name, api, options, validationCb, unique) => {
  const n = name || `should allow paginating with page and pageSize for ${api}`;
  const pageSize = options ? options.qs ? options.qs.pageSize ? options.qs.pageSize : 2 : 2 : 2;
  const page = options ? options.qs ? options.qs.page ? options.qs.page : 1 : 1 : 1;
  const where = options ? options.qs ? options.qs.where ? options.qs.where : null : null: null;
  const path = options ? options.qs ? options.qs.path ? options.qs.path : null : null: null;
  const options1 = Object.assign({}, options, { qs: { page: page, pageSize: pageSize } });
  const options2 = Object.assign({}, options, { qs: { page: page + 1, pageSize: pageSize } });
  const options3 = Object.assign({}, options, { qs: { page: page, pageSize: (pageSize * 2) } });
  let result1 = { body: [] }, result2 = { body: [] }, result3 = { body: [] };
  const getWithOptions = (option, result) => {
    // Adding the 'where' clause if it exists
    if (where) option.qs.where = where;
    if (path) option.qs.path = path;
    return cloud.withOptions(option).get(api)
      .then((r) => {
        if (r.body && r.body.length > 0) {
          result.body = r.body;
          expect(result.body.length).to.be.below(option.qs.pageSize + 1);
          return r.response.headers['elements-next-page-token'];
        }
      });
  };
  return boomGoesTheDynamite(n, () => {
    return getWithOptions(options1, result1)
    .then(nextPage => getWithOptions(nextPage ? { qs: { pageSize: pageSize, nextPage: nextPage, page: page+1 }} : options2, result2))
    .then(nextPage => getWithOptions(nextPage ? { qs: { pageSize: pageSize * 2}} : options3, result3))
    .then(() => {
      if (unique) {
        result3.body = tools.getKey(result3.body, unique);
        result2.body = tools.getKey(result2.body, unique);
        result1.body = tools.getKey(result1.body, unique);
      }
      if (result3.body.length === pageSize*2 && result1.body.length === pageSize && result2.body.length === pageSize) {
        expect(result3.body[0]).to.deep.equal(result1.body[0]);
        expect(result3.body[result3.body.length - 1]).to.deep.equal(result2.body[result2.body.length - 1]);
        expect(result3.body[pageSize]).to.deep.equal(result2.body[0]);
        expect(result3.body).to.deep.equal(result1.body.concat(result2.body));
      }
    });
  }, options ? options.skip : false);
};

const paginate = (api, options, validationCb, nextPage, page, max, all) => {
  if (page > max) return all;
  logger.debug(`finding page ${page} of results for ${api} using ${nextPage}`);

  options = options || {};
  options.qs = options.qs || {};
  options.qs.nextPage = nextPage;
  options.qs.pageSize = 1;

  return cloud.withOptions(options).get(api, validationCb)
    .then(r => {
      expect(r.body).to.not.be.null;
      all = all.concat(r.body);
      return paginate(api, options, validationCb, r.response.headers['elements-next-page-token'], page + 1, max, all);
    });
};

const itNextPagePagination = (name, api, payload, amount, shouldCreate, options, validationCb) => {
  const itNextPagePaginationCreate = () => {
    const ids = [];
    const promises = [];
    amount = amount || 5;
    options = options || {};
    for (let i = 0; i < amount; i++) { promises.push(cloud.post(api, payload)); }

    return chakram.all(promises)
      .then(r => r.forEach(o => ids.push(o.body.id)))
      .then(r => paginate(api, options, validationCb, null, 1, amount, []))
      .then(r => expect(r).to.have.length(amount))
      .then(r => ids.forEach(id => cloud.delete(`${api}/${id}`)));
  };

  const itNextPagePagination = () => {
    return paginate(api, options, validationCb, null, 1, amount, [])
      .then(r => expect(r).to.have.length(amount));
  };

  const n = name || `should allow paginating with page and nextPage ${api}`;
  boomGoesTheDynamite(n, () => {
    return shouldCreate ?
      itNextPagePaginationCreate() :
      itNextPagePagination();
  }, options ? options.skip : false);
};

const it404 = (name, api, invalidId, method, cloudCb, options) => {
  const n = name || `should throw a 404 when trying to ${method} ${api} with an ID that does not exist`;
  if (invalidId) api = api + '/' + invalidId;
  boomGoesTheDynamite(n, () => cloudCb(api, (r) => expect(r).to.have.statusCode(404)), options ? options.skip : false);
};

const itValidation = (name, api, method, payload, options, validationCb) => {
  const getCloudMethod = (method) => {
    let cloudMethod;
    if (method.toUpperCase() === 'POST') {
      cloudMethod = cloud.withOptions(options).post;
    } else if (method.toUpperCase() === 'PATCH') {
      cloudMethod = cloud.withOptions(options).patch;
    } else if (method.toUpperCase() === 'PUT') {
      cloudMethod = cloud.withOptions(options).put;
    } else if (method.toUpperCase() === 'GET') {
      cloudMethod = cloud.withOptions(options).get;
    } else if (method.toUpperCase() === 'DELETE') {
      cloudMethod = cloud.withOptions(options).delete;
    }
    return cloudMethod;
  };
  const n = name || `should throw pass validation when trying to ${method} ${api}`;
  if (payload) {
    boomGoesTheDynamite(n, () => getCloudMethod(method)(api, payload, validationCb), options ? options.skip : false);
  } else {
    boomGoesTheDynamite(n, () => getCloudMethod(method)(api, validationCb), options ? options.skip : false);
  }
};

const itUpdate404 = (name, api, payload, invalidId, method, chakramUpdateCb, options) => {
  const n = name || `should throw a 404 when trying to ${method} ${api} with an ID that does not exist`;
  if (invalidId) api = api + '/' + invalidId;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).update(api, (payload || {}), (r) => expect(r).to.have.statusCode(404), chakramUpdateCb), options ? options.skip : false);
};

const itUpdate403 = (name, api, payload, method, chakramUpdateCb, options) => {
  const n = name || `should throw a 403 when trying to ${method} ${api} with improper permissions`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).update(api, (payload || {}), (r) => expect(r).to.have.statusCode(403), chakramUpdateCb), options ? options.skip : false);
};

const itUpdate400 = (name, api, payload, method, chakramUpdateCb, options) => {
  const n = name || `should throw a 400 when trying to ${method} ${api} with invalid params`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).update(api, (payload || {}), (r) => expect(r).to.have.statusCode(400), chakramUpdateCb), options ? options.skip : false);
};

const itPostError = (name, httpCode, api, payload, options) => {
  const suffix = payload ? 'invalid JSON body' : 'empty JSON body';
  let n = name || `should throw a ${httpCode} when trying to create a(n) ${api} with an ${suffix}`;
  boomGoesTheDynamite(n, () => cloud.withOptions(options).post(api, payload, (r) => expect(r).to.have.statusCode(httpCode)), options ? options.skip : false);
};

const itPaginationForNested = (name, parentObject, parentPayload, childObject, childPayload, uniqueField, options) => {
  const n = name || `should validate paginating with nextPage and pageSize for ${parentObject}/:id/${childObject}`;
  const usePayloadList = Array.isArray(childPayload);
  let parentId, childIds = [], list = usePayloadList ? childPayload : [0, 1, 2, 3];
  return boomGoesTheDynamite(n, () => {
    return cloud.post(parentObject, parentPayload)
    .then(r => parentId = r.body.id)
    .then(r => chakram.all(list.map(pay => cloud.post(`${parentObject}/${parentId}/${childObject}`,
          usePayloadList ? pay : typeof childPayload === 'function' ? childPayload() : childPayload))))
    .then(r => r.forEach(o => childIds.push(o.body.id)))
    .then(r => cloud.withOptions(options).supportPagination(`${parentObject}/${parentId}/${childObject}`, uniqueField || 'id'))
    .then(r => Promise.all(childIds.map(childId => cloud.delete(`${parentObject}/${parentId}/${childObject}/${childId}`))))
    .then(r => cloud.delete(`${parentObject}/${parentId}`))
    .catch(e => {
      logger.debug(`Error while paginating`, e);
      cloud.delete(`${parentObject}/${parentId}`);
    });
  }, options ? options.skip : false);
};

const itCeqlSearch = (name, api, payload, field, options) => {
  const n = name || `should support searching ${api} by ${field}`;
  boomGoesTheDynamite(n, () => {
    let id, value;
    let tranformedObjs = props.getOptionalForKey(props.getOptional('element'), 'transformed') || [];
    //Have to update field for the query if there is a transformation
    let transform = tranformedObjs.reduce((acc, cur) => acc = acc ? acc : api.split('/').slice(-2).filter(str => str === cur).length > 0 ? true : false, false);
    if (field === 'id' && transform) field = 'idTransformed';
    return cloud.post(api, payload)
      .then(r => {
        id = r.body.id;
        value = r.body[field];
        const clause = `${field}='${value}'`; // have to escape where values with single quotes
        const myOptions = Object.assign({}, options, { qs: { where: clause } });
        return cloud.withOptions(myOptions).get(api, (r) => {
          expect(r).to.have.statusCode(200);
          expect(r.body.filter(obj => obj[field] === value).length).to.equal(r.body.length);
        });
      })
      .then(r => cloud.delete(api + '/' + id));
  }, options ? options.skip : false);
};

const itCeqlSearchMultiple = (name, api, payload, field, options) => {
  const n = name || `should support searching ${api} by ${field}`;
  boomGoesTheDynamite(n, () => {
    let id, value;
    let tranformedObjs = props.getOptionalForKey(props.getOptional('element'), 'transformed') || [];
    //Have to update field for the query if there is a transformation
    let transform = tranformedObjs.reduce((acc, cur) => acc = acc ? acc : api.split('/').slice(-2).filter(str => str === cur).length > 0 ? true : false, false);
    if (field === 'id' && transform) field = 'idTransformed';
    return cloud.post(api, payload)
      .then(r => {
        id = r.body.id;
        value = r.body[field];
        const clause = `${field}='${value}'`; // have to escape where values with single quotes
        const myOptions = Object.assign({}, options, { qs: { where: clause } });
        return cloud.withOptions(myOptions).get(api, (r) => {
          expect(r).to.have.statusCode(200);
          r.body.forEach(resource => {
            expect(resource[field]).to.equal(value);
          });
        });
      })
      .then(r => cloud.delete(api + '/' + id));
  }, options ? options.skip : false);
};
const itPolling = (name, pay, api, options, validationCb, payload, resource, addMethod) => {
  name = 'polling ' + api;
  payload = payload ? payload : pay;
  let response;
  boomGoesTheDynamite(name, () => {
    const baseUrl = faker.fake(props.get('event.callback.url'));
    const url = baseUrl + '?returnQueue';
    const addResource = (r) => addMethod ? addMethod(r) : cloud.withOptions(options).post(api, r);
    const defaultValidation = (r) => expect(r).to.have.statusCode(200);
    const validate = validationCb && typeof validationCb === 'function' && validationCb.toString() !== defaultValidation.toString() ? validationCb : (res) => {
      expect(res.count).to.be.above(0);
      let objCalls = res.data.filter(call => {
        let datas = JSON.parse(call.data);
        logger.debug(`Resource returned: ${datas.message.raw.objectType}`);
        logger.debug(`Resource expecting: ${resource}`);
        return datas.message.raw.objectType === resource;
      });

      if (resource) expect(objCalls).to.have.length.above(0);
    };
    if(!baseUrl) logger.error('No callback url found. Are you sure this element supports polling?');
    expect(baseUrl).to.exist;
    const instanceId = global.instanceId || argv.instance;
    const updatePayload = { configuration: { "event.notification.callback.url": baseUrl } };

    //updates the instance with new callback url to get a unique bin each for each poller
    return cloud.patch(`/instances/${instanceId}`, updatePayload)
    .then(() => cloud.get(`elements/${props.getForKey(tools.getBaseElement(props.get('element')), 'elementId')}/metadata`))
    .then(r => {
      const supportsPolling = r.body.events.supported && r.body.events.methods.includes('polling');
      //logs error then fails test
      if (!supportsPolling) logger.error('This element doesn\'t support polling');
      expect(supportsPolling).to.be.true;
    })
    .then(r => {
      logger.info('Testing polling may take up to 2 minutes');
      pay = typeof payload === 'function' ? payload() : payload;
      //clears the bin before creating and checking bin again
      return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
          if(err) reject(err);
          resolve(body);
        });
      });
    })
    .then(() => pay)
    .then(r => addResource(r))
    .then(r => response = r.body)
    //repeatly revalidates until either valid or time out
    .then(() => tools.wait.upTo(120000).for(() => new Promise((resolve, reject) => {
      request(url, (err, res, body) => {
        if(err) reject(err);
        resolve(body);
      });
    })
    //runs through validation function
    .then(r => validate(JSON.parse(r)))))
    //clean up
    .then(() => cloud.delete(`${api}/${response.id}`).catch(() => {})).catch(e => { if (response) {return cloud.delete(`${api}/${response.id}`).catch(() => {}).then(() => { throw new Error(e); });} else { throw new Error(e);}});
  }, (argv.polling ? false : true) || (options ? options.skip : false));
};

const itBulkDownload = (name, hub, metadata, options, opts, endpoint) => {
  const n = name || `should support bulk download with options`;
  let bulkId, bulkResults, jsonMeta, csvMeta;
  // gets metadata ready for testing csv and json responses
  const getJson = opts ? opts.json : false;
  jsonMeta = JSON.parse(JSON.stringify(metadata));
  metadata ? metadata.headers ? jsonMeta.headers.accept = "application/json" : jsonMeta.headers = { accept: "application/json" } : jsonMeta = { headers: { accept: "application/json" } };
  const getCsv = opts ? opts.csv : false;
  csvMeta = JSON.parse(JSON.stringify(metadata));
  metadata ? metadata.headers ? csvMeta.headers.accept = "text/csv" : csvMeta.headers = { accept: "text/csv" } : csvMeta = { headers: { accept: "text/csv" } };
  const element = opts ? opts.element : null;
  metadata = tools.updateMetadata(metadata);
  // gets integer limit from ceql query
  const limit = tools.getLimit(metadata);
  const fields = tools.getFieldsFromTransformation(element || argv.element, endpoint);
  boomGoesTheDynamite(n, () => {
    // gets regular call to later check the validity of the bulk job
    return cloud.withOptions(metadata).get(`/hubs/${hub}/${endpoint}`)
      .then(r => bulkResults = limit > -1 ? r.body.slice(0, limit) : r.body)
      // start bulk download
      .then(r => cloud.withOptions(metadata).post(`/hubs/${hub}/bulk/query`))
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk download status
      .then(r => tools.wait.upTo(opts.timeout ? opts.timeout : 60000).for(() => cloud.get(`/hubs/${hub}/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
        return r;
      })))
      .then(r => {
        expect(r.body.recordsFailedCount).to.equal(0);
        expect(r.body.recordsCount).to.equal(bulkResults.length);
      })
      // get bulk query results in JSON
      .then(r => getJson ? cloud.withOptions(jsonMeta)
        .get(`/hubs/${hub}/bulk/${bulkId}/${endpoint}`, r => {
          if (fields !== null) {
            let bulkDownloadResults = tools.getFieldsMap(tools.getJson(r.body), fields);
            expect(bulkDownloadResults).to.deep.equal(tools.getFieldsMap(bulkResults, fields));
          } else {
            let bulkDownloadResults = tools.getKey(tools.getJson(r.body), 'id');
            expect(bulkDownloadResults).to.deep.equal(tools.getKey(bulkResults, 'id'));
          }
        }) : Promise.resolve(null))
      // get bulk query results in CSV
      .then(r => getCsv ? cloud.withOptions(csvMeta)
        .get(`/hubs/${hub}/bulk/${bulkId}/${endpoint}`, r => {
          if (typeof r.body === 'string') {
            if (fields !== null) {
              let bulkDownloadResults = tools.getFieldsMap(tools.csvParse(r.body), fields);
              expect(bulkDownloadResults).to.deep.equal(tools.getFieldsMap(bulkResults, fields));
            } else {
              let bulkDownloadResults = tools.getKey(tools.csvParse(r.body), 'id');
              expect(bulkDownloadResults).to.deep.equal(tools.getKey(bulkResults, 'id'));
            }
          }
        }) : Promise.resolve(null));
  }, options ? options.skip : false);
};

const itBulkDownloadBasic = (name, hub, metadata, options, opts, endpoint) => {
  const n = name || `should support bulk download with options`;
  let bulkId, jsonMeta, csvMeta;
  // gets metadata ready for testing csv and json responses
  jsonMeta = JSON.parse(JSON.stringify(metadata));
  metadata ? metadata.headers ? jsonMeta.headers.accept = "application/json" : jsonMeta.headers = { accept: "application/json" } : jsonMeta = { headers: { accept: "application/json" } };
  csvMeta = JSON.parse(JSON.stringify(metadata));
  metadata ? metadata.headers ? csvMeta.headers.accept = "text/csv" : csvMeta.headers = { accept: "text/csv" } : csvMeta = { headers: { accept: "text/csv" } };
  metadata = tools.updateMetadata(metadata);
  boomGoesTheDynamite(n, () => {
    // start the bulk download
    return cloud.withOptions(metadata).post(`/hubs/${hub}/bulk/query`)
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk download status
      .then(r => tools.wait.until(opts.timeout ? opts.timeout : 60000, 5000).for(() => cloud.get(`/hubs/${hub}/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
        return r;
      })))
      .then(r => {
        expect(r.body.recordsFailedCount).to.equal(0);
      });
  }, options ? options.skip : false);
};

const itBulkUpload = (name, hub, endpoint, metadata, filePath, options, where) => {
  const n = name || `should support bulk upload with options`;
  let bulkId;
  boomGoesTheDynamite(n, () => {
    expect(fs.existsSync(filePath)).to.be.true;
    let file = fs.readFileSync(filePath, 'utf8');
    try { file = JSON.parse(file); } catch (e) { file = tools.csvParse(file); }
    expect(file).to.exist;
    logger.info('Running bulk process, may take upto 2 minutes');
    // start bulk upload
    return cloud.withOptions(metadata).postFile(`/hubs/${hub}/bulk/${endpoint}`, filePath)
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk upload status
      .then(r => tools.wait.upTo(120000).for(() => cloud.get(`/hubs/${hub}/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
        return r;
      })))
      .then(r => {
        expect(r.body.recordsFailedCount).to.equal(0);
        expect(r.body.recordsCount).to.equal(file.length);
      })
      .then((r) => {
        const deleteIds = (where) => {
          return cloud.withOptions({ qs: { where: where } }).get(`/hubs/${hub}/${endpoint}`)
            .then(r => {
              return r.body.filter(obj => obj.id).map(obj => obj.id);
            })
            .then(ids => ids.map(id => cloud.delete(`/hubs/${hub}/${endpoint}/${id}`)));
        };
        return where ? deleteIds(where) : Promise.all(file.map(obj => deleteIds(tools.createExpression(obj))));
      });
  }, options ? options.skip : false);
};

const runTests = (api, payload, validationCb, tests, hub) => {
  const should = (api, validationCb, payload, options, name, hub) => ({
    /**
     * Flexible HTTP request test that validates basic response
     * @memberof module:core/suite.test.should
     */
    supportValidation: (method) => itValidation(name, api, method, payload, options, validationCb),
    /**
     * HTTP POST that validates that the response is a 400
     * @memberof module:core/suite.test.should
     */
    return400OnPost: () => itPostError(name, 400, api, payload, options),
    /**
     * HTTP PUT that validates that the response is a 400
     * @memberof module:core/suite.test.should
     */
    return400OnPut: () => itUpdate400(name, api, payload, 'PUT', chakram.put, options),
    /**
     * HTTP POST that validates that the response is a 409
     * @memberof module:core/suite.test.should
     */
    return409OnPost: () => itPostError(name, 409, api, payload, options),
    /**
     * HTTP PATCH that validates that the response is a 404
     * @param {string} [invalidId=-1] The invalid ID
     * @memberof module:core/suite.test.should
     */
    return404OnPatch: (invalidId) => itUpdate404(name, api, payload, invalidId, 'PATCH', chakram.patch, options),
    /**
     * HTTP PUT that validates that the response is a 403
     * @param {string} [invalidId=-1] The invalid ID
     * @memberof module:core/suite.test.should
     */
    return403OnPut: () => itUpdate403(name, api, payload, 'PUT', chakram.put, options),
    /**
     * HTTP PUT that validates that the response is a 404
     * @param {string} [invalidId=-1] The invalid ID
     * @memberof module:core/suite.test.should
     */
    return404OnPut: (invalidId) => itUpdate404(name, api, payload, invalidId, 'PUT', chakram.put, options),
    /**
     * HTTP GET that validates that the response is a 404
     * @param {string} [invalidId=-1] The invalid ID
     * @memberof module:core/suite.test.should
     */
    return404OnGet: (invalidId) => it404(name, api, invalidId, 'GET', cloud.get, options),
    /**
     * HTTP DELETE that validates that the response is a 404
     * @param {string} [invalidId=-1] The invalid ID
     * @memberof module:core/suite.test.should
     */
    return404OnDelete: (invalidId) => it404(name, api, invalidId, 'DELETE', cloud.delete, options),
    /**
     * HTTP POST that validates that the response is a 200
     * @memberof module:core/suite.test.should
     */
    return200OnPost: () => itPost(name, api, payload, options, validationCb),
    /**
     * HTTP GET that validates that the response is a 200
     * @memberof module:core/suite.test.should
     */
    return200OnGet: () => itGet(name, api, options, validationCb),
    /**
    * @param {object || Function} pay: The payload used to create a new object
    * @param {String} res Resource polling on
    * @param {Function} addMethod A method to create or update a reasource. Ex: cloud.postFile('/path')
    * @memberof module:core/suite.test.should
    */
    supportPolling: (pay, res, addMethod) => itPolling(name, payload, api, options, validationCb, pay, res, addMethod),
    /**
     * Downloads bulk with options and verifies it completes and that none fail. Validates accuracy of bulk
     * @param {object} metadata -> headers, query string etc...
     * @param {object} opts -> To test json and csv. If null it will test endpoints default. EXAMPLE "{json: true, csv: true}"
     * @param {string} object -> object we are calling: contacts, accounts, etc..
     * @memberof module:core/suite.test.should
     */
    supportBulkDownload: (metadata, opts, object) => itBulkDownload(name, hub, metadata, options, opts, object),
    /**
     * Downloads bulk with options and verifies it completes and that none fail. Does not validate accuracy of bulk
     * @param {object} metadata -> headers, query string etc...
     * @param {object} opts -> To test json and csv. If null it will test endpoints default. EXAMPLE "{json: true, csv: true}"
     * @param {string} object -> object we are calling: contacts, accounts, etc..
     * @memberof module:core/suite.test.should
     */
    supportBulkDownloadBasic: (metadata, opts, object) => itBulkDownloadBasic(name, hub, metadata, options, opts, object),
    /**
     * Uploads bulk with options to specific object and verifies it completes and that none fail. Deletes records after completion
     * @param {object} metadata -> headers, query string etc...
     * @param {string} object -> object we are calling: contacts, accounts, etc..
     * @param {string} filePath -> path to file we are uploading
     * @param {string} where -> (optional) where query that will grab the records in the file to delete them
     * If the `where` param is missing it will create a where query
     *     EXAMPLE: Json-> "{"firstName": "Austin", "lastName": "Mahan"}" | Where -> firstName = 'Austin' AND lastName = 'Mahan'
     * @memberof module:core/suite.test.should
     */
    supportBulkUpload: (metadata, filePath, object, where) => itBulkUpload(name, hub, object, metadata, filePath, options, where),
    /**
     * Validates that the given API `page` and `pageSize` pagination.  In order to test this, we create a few objects and then paginate
     * through the results before cleaning up any resources that were created.
     * @param {string} unique -> A unique identifier for each page to validate correct pagination
     * @memberof module:core/suite.test.should
     */
    supportPagination: (unique) => itPagination(name, api, options, validationCb, unique),
     /**
     * Validates paginating nested objects, creating 4 child objects for the parent in the process.
     * The `childPayload` can be a function, object, or array of objects
     * @param {string} parentObject
     * @param {object} parentPayload
     * @param {string} childObject
     * @param {any} childPayload
     * @param {string} uniqueField defaults to 'id'
     * @memberof module:core/suite.test.should
     */
    supportPaginationForNested: (childObject, childPayload, uniqueField) => itPaginationForNested(name, api, payload, childObject, childPayload, uniqueField, options),
    /**
     * Validates that the given API supports `nextPageToken` type pagination.
     * @param {number} amount The number of objects to paginate through
     * @param {boolean} shouldCreate  Should we create objects to paginate through?
     * @memberof module:core/suite.test.should
     */
    supportNextPagePagination: (amount, shouldCreate) => itNextPagePagination(name, api, payload, amount, shouldCreate, options, validationCb),
    /**
     * Validates that the given API resource supports searching by a CEQL query and the query finds 1 resource.
     * @param {string} field The field to search by
     * @memberof module:core/suite.test.should
     */

    supportCeqlSearch: (field) => itCeqlSearch(name, api, payload, field, options),
    /**
     * Validates that the given API resource supports searching by a CEQL query and the query may find multiple objects.
     * Validates that the query field value matches the value that was searched for.
     * @param {string} field The field to search by
     * @memberof module:core/suite.test.should
     */

    supportCeqlSearchForMultipleRecords: (field) => itCeqlSearchMultiple(name, api, payload, field, options),
    /**
     * Validates that the given API resource supports CRUDS
     * @param {Function} [updateCb=chakram.put] The update callback (`chakram.patch` can also be used)
     * @memberof module:core/suite.test.should
     */
    supportCruds: (updateCb) => itCruds(name, api, payload, validationCb, updateCb, options),
    /**
     * Validates that the given API resource supports CRUD
     * @param {Function} [updateCb=chakram.put] The update callback (`chakram.patch` can also be used)
     * @memberof module:core/suite.test.should
     */
    supportCrud: (updateCb) => itCrud(name, api, payload, validationCb, updateCb, options),
    /**
     * Validates that the given API resource supports CRUS
     * @param {Function} [updateCb=chakram.put] The update callback (`chakram.patch` can also be used)
     * @memberof module:core/suite.test.should
     */
    supportCrus: (updateCb) => itCrus(name, api, payload, validationCb, updateCb, options),
    /**
     * Validates that the given API resource supports CRD
     * @memberof module:core/suite.test.should
     */
    supportCrd: () => itCrd(name, api, payload, validationCb, options),
    /**
     * Validates that the given API resource supports CD
     * @memberof module:core/suite.test.should
     */
    supportCd: () => itCd(name, api, payload, validationCb, options),
    /**
     * Validates that the given API resource supports CRDS
     * @memberof module:core/suite.test.should
     */
    supportCrds: () => itCrds(name, api, payload, validationCb, options),
    /**
     * Validates that the given API resource supports RS
     * @memberof module:core/suite.test.should
     */
    supportSr: () => itSr(name, api, validationCb, options),
    /**
     * Validates that the given API resource supports S
     * @memberof module:core/suite.test.should
     */
    supportS: () => itS(name, api, validationCb, options),
    /**
     * Validates that the given API resource supports CRS
     * @memberof module:core/suite.test.should
     */
    supportCrs: () => itCrs(name, api, payload, validationCb, options),
    /**
     * Validates that the given API resource supports CR
     * @memberof module:core/suite.test.should
     */
    supportCr: () => itCr(name, api, payload, validationCb, options),
    /**
     * Validates that the given API resource supports CS
     * @memberof module:core/suite.test.should
     */
    supportCs: () => itCs(name, api, payload, validationCb, options),
  });

  const using = (myApi, myValidationCb, myPayload, myOptions, myName) => ({
    should: should(myApi, myValidationCb, myPayload, myOptions, myName, hub),
    withName: (myName) => using(myApi, myValidationCb, myPayload, myOptions, myName),
    withApi: (myApi) => using(myApi, myValidationCb, myPayload, myOptions, myName),
    withValidation: (myValidationCb) => using(myApi, myValidationCb, myPayload, myOptions, myName),
    withJson: (myPayload) => using(myApi, myValidationCb, myPayload, myOptions, myName),
    withOptions: (myOptions) => using(myApi, myValidationCb, myPayload, myOptions, myName)
  });

  /**
   * The test namespace which is generated for any `suite.forElement` or `suite.forPlatform` functions.  This context
   * contains many helpful functions that can drastically simplify test writing for CE APIs
   * @memberof module:core/suite
   * @namespace test
   */
  const test = {
    api: api,
    /**
     * The should namespace contains many standard test cases that wrap mocha `it` blocks.  This can be chained with any
     * of the other available functions underneath the `test` namespace.  Some examples:
     * ```
     * test
     *  .should.return200OnGet();
     *
     * test
     *  .withApi('/hubs/crm/accounts')
     *  .should.return200OnGet();
     *
     * test
     *  .withApi('/hubs/crm/accounts')
     *  .withValidationCb((r) => expect(r).to.have.statusCode(200))
     *  .should.return200OnGet();
     * ```
     * @memberof module:core/suite.test
     * @namespace should
     */
    should: should(api, validationCb, payload, null, null, hub),
    /**
     * Overrides the default name for any tests
     * @param {string} myName The name of the test
     * @memberof module:core/suite.test
     * @namespace withName
     */
    withName: (myName) => using(api, validationCb, payload, null, myName),
    /**
     * Overrides the default API for any tests
     * @param {string} myApi The API to override with
     * @memberof module:core/suite.test
     * @namespace withApi
     */
    withApi: (myApi) => using(myApi, validationCb, payload),
    /**
     * Overrides the default validator for any tests
     * @param {Function} myValidationCb The validation function
     * @memberof module:core/suite.test
     * @namespace withValidation
     */
    withValidation: (myValidationCb) => using(api, myValidationCb, payload),
    /**
     * Overrides the default JSON payload that will be used for any create or update API calls
     * @param {Object} myPayload The JSON payload
     * @memberof module:core/suite.test
     * @namespace withValidation
     */
    withJson: (myPayload) => using(api, validationCb, myPayload),
    /**
     * Specifies that any API calls made should use the given request options.  The available request options include
     * everything available in the "request" libraries options object (https://github.com/request/request#requestoptions-callback)
     * as well as the following custom churros options:
     * {
     *   "skip": boolean, // skips this test
     *   "churros": {
     *     "updatePayload": {...} // uses this as the upload payload
     *   }
     * }
     * @param {Object} myOptions The request options to override with
     * @memberof module:core/suite.test
     * @namespace withOptions
     */
    withOptions: (myOptions) => using(api, validationCb, payload, myOptions)
  };

  tests ? tests(test) : it('add some tests to me!!!', () => true);
};

const run = (api, resource, options, defaultValidation, tests, hub) => {
  // if options is a function, we're assuming those are the tests
  if (typeof options === 'function') {
    tests = options;
    options = {};
  }

  options = options || {};
  const name = options.name || resource;
  let propsSkip = false;
  try {
    let element = props.get('element');
    propsSkip = props.getOptionalForKey(element, 'skip');
    //Will only run on endpoints specified if given
    let endpoints = props.getOptionalForKey(element, 'endpoints');
    if (endpoints && !endpoints.includes(resource)) { options.skip = true; }
  } catch (e) {}
  if (options.skip || propsSkip) {
    describe.skip(name, () => runTests(api, options.payload, defaultValidation, tests, hub));
  } else {
    describe(name, function() {
      let ctx = this;
      if (options.useElement) { //Run on a different cred set if given
        let oldToken;
        let oldInstanceId;
        before(() => {
          //skip if not part of endpoints
          let endpoints = props.getOptionalForKey(options.useElement, 'endpoints');
          if (endpoints && !endpoints.includes(resource)) { return ctx.skip(); }
          oldToken = defaults.getToken();
          oldInstanceId = global.instanceId;
          return provisioner.create(options.useElement);
        });
        after(() => {
          return provisioner.delete(global.instanceId).catch(() => {})
          .then(() => {
            defaults.token(oldToken);
            global.instanceId = oldInstanceId;
          });
        });
      }
      return runTests(api, options.payload, defaultValidation, tests, hub);
    });
  }
};

/**
 * Starts up a new test suite for an element.  This wraps all of the given tests in a mocha describe block, and provides
 * a bunch of convenience functions inside of the given tests under the 'test' object.

 * @param  {string} hub       The hub that this element is in (i.e. crm, marketing, etc.)
 * @param  {string} resource  The name of the elements API resource this test suite is for
 * @param  {object} options   The, optional, suite options:
 * {
 *   name: mochaDescribeNameThatOverridesTheResourceName,
 *   payload: defaultPaylodThatWillBeUsedOnPostCalls,
 *   schema: defaultValidationThatWillHappenOnAllApiCallsExceptDeletes
 * }
 * @param  {Function} tests   A function, containing all test
 */
exports.forElement = (hub, resource, options, tests) => run(`/hubs/${hub}/${resource}`, resource, options, (r) => expect(r).to.have.statusCode(200), tests, hub);

/**
 * Starts up a new test suite for a platform resource.  This wraps all of the given tests in a mocha describe block, and
 * provides a bunch of convenience functions inside of the given tests under the 'test' object.

 * @param  {string} resource     The name of the platform API resource this test suite is for
 * @param  {object} options      The, optional, suite options:
 * {
 *   name: mochaDescribeNameThatOverridesTheResourceName,
 *   payload: defaultPaylodThatWillBeUsedOnPostCalls,
 *   schema: defaultValidationThatWillHappenOnAllApiCallsExceptDeletes
 * }
 * @param  {Function} tests      A function, containing all tests
 */
exports.forPlatform = (resource, options, tests) => run(`/${resource}`, resource, options, options.schema, tests);
