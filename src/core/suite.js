'use strict';

const util = require('util');
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');

var exports = module.exports = {};

const itPost = (name, api, payload, options, validationCb) => {
  const n = name || util.format('should allow POST for %s', api);
  it(n, () => cloud.withOptions(options).post(api, payload, validationCb));
};

const itGet = (name, api, options, validationCb) => {
  const n = name || util.format('should allow GET for %s', api);
  it(n, () => cloud.withOptions(options).get(api, validationCb));
};

const itCrd = (name, api, payload, validationCb, options) => {
  const n = name || util.format('should allow CRD for %s', api);
  it(n, () => cloud.withOptions(options).crd(api, payload, validationCb));
};

const itCd = (name, api, payload, validationCb, options) => {
  const n = name || util.format('should allow CD for %s', api);
  it(n, () => cloud.withOptions(options).cd(api, payload, validationCb));
};

const itCrds = (name, api, payload, validationCb, options) => {
  const n = name || util.format('should allow CRDS for %s', api);
  it(n, () => cloud.withOptions(options).crds(api, payload, validationCb));
};

const itCrud = (name, api, payload, validationCb, updateCb, options) => {
  const n = name || util.format('should allow CRUD for %s', api);
  it(n, () => cloud.withOptions(options).crud(api, payload, validationCb, updateCb));
};

const itCruds = (name, api, payload, validationCb, updateCb, options) => {
  const n = name || util.format('should allow CRUDS for %s', api);
  it(n, () => cloud.withOptions(options).cruds(api, payload, validationCb, updateCb));
};

const itCrus = (api, payload, validationCb, updateCb, options) => {
  const name = util.format('should allow CRUS for %s', api);
  it(name, () => cloud.withOptions(options).crus(api, payload, validationCb, updateCb));
};

const itSr = (name, api, validationCb, options) => {
  const n = name || util.format('should allow SR for %s', api);
  it(n, () => cloud.withOptions(options).get(api).then(r => cloud.get(api + '/' + r.body[0].id)));
};

const itPagination = (name, api, validationCb) => {
  const n = name || util.format('should allow paginating %s', api);
  const options = { qs: { page: 1, pageSize: 1 } };

  it(n, () => cloud.withOptions(options).get(api, validationCb));
};

const itGet404 = (name, api, invalidId) => {
  const n = name || util.format('should throw a 404 when trying to retrieve a(n) %s with an ID that does not exist', api);
  if (invalidId) api = api + '/' + invalidId;
  it(n, () => cloud.get(api, (r) => expect(r).to.have.statusCode(404)));
};

const itPatch404 = (name, api, payload, invalidId) => {
  const n = name || util.format('should throw a 404 when trying to update a(n) %s with an ID that does not exist', api);
  if (invalidId) api = api + '/' + invalidId;
  it(n, () => cloud.update(api, (payload || {}), (r) => expect(r).to.have.statusCode(404), chakram.patch));
};

const itPost400 = (name, api, payload) => {
  let n = name || util.format('should throw a 400 when trying to create a(n) %s with an %s JSON body', api);
  payload ? n = util.format(n, 'invalid') : n = util.format(n, 'empty');
  it(n, () => cloud.post(api, payload, (r) => expect(r).to.have.statusCode(400)));
};

const itCeqlSearch = (name, api, payload, field) => {
  const n = name || util.format('should support searching %s by %s', api, field);
  it(n, () => {
    let id;
    return cloud.post(api, payload)
      .then(r => {
        id = r.body.id;
        const clause = util.format("%s='%s'", field, r.body[field]); // have to escape where values with single quotes
        const options = { qs: { where: clause } };
        return cloud.withOptions(options).get(api, (r) => {
          expect(r).to.have.statusCode(200);
          expect(r.body.length).to.equal(1);
        });
      })
      .then(r => cloud.delete(api + '/' + id));
  });
};

const runTests = (api, payload, validationCb, tests) => {
  const should = (api, validationCb, payload, options, name) => {
    return {
      return400OnPost: () => itPost400(name, api, payload),
      return404OnPatch: (invalidId) => itPatch404(name, api, payload, invalidId),
      return404OnGet: (invalidId) => itGet404(name, api, invalidId),
      return200OnPost: () => itPost(name, api, payload, options, validationCb),
      return200OnGet: () => itGet(name, api, options, validationCb),
      supportPagination: () => itPagination(name, api, validationCb),
      supportCeqlSearch: (field) => itCeqlSearch(name, api, payload, field),
      supportCruds: (updateCb) => itCruds(name, api, payload, validationCb, updateCb, options),
      supportCrud: (updateCb) => itCrud(name, api, payload, validationCb, updateCb, options),
      supportCrus: (updateCb) => itCrus(api, payload, validationCb, updateCb, options),
      supportCrd: () => itCrd(name, api, payload, validationCb, options),
      supportCd: () => itCd(name, api, payload, validationCb, options),
      supportCrds: () => itCrds(name, api, payload, validationCb, options),
      supportSr: () => itSr(name, api, validationCb, options),
    };
  };

  const using = (myApi, myValidationCb, myPayload, myOptions, myName) => {
    return {
      should: should(myApi, myValidationCb, myPayload, myOptions, myName),
      withName: (myName) => using(myApi, myValidationCb, myPayload, myOptions, myName),
      withApi: (myApi) => using(myApi, myValidationCb, myPayload, myOptions, myName),
      withValidation: (myValidationCb) => using(myApi, myValidationCb, myPayload, myOptions, myName),
      withJson: (myPayload) => using(myApi, myValidationCb, myPayload, myOptions, myName),
      withOptions: (myOptions) => using(api, validationCb, payload, myOptions, myName)
    };
  };

  const test = {
    api: api,
    should: should(api, validationCb, payload),
    withName: (myName) => using(api, validationCb, payload, null, myName),
    withApi: (myApi) => using(myApi, validationCb, payload),
    withValidation: (myValidationCb) => using(api, myValidationCb, payload),
    withJson: (myPayload) => using(api, validationCb, myPayload),
    withOptions: (myOptions) => using(api, validationCb, payload, myOptions)
  };

  tests ? tests(test) : it('add some tests to me!!!', () => true);
};

exports.forElement = (hub, resource, payload, tests) => {
  describe(resource, () => {
    let api = util.format('/hubs/%s/%s', hub, resource);
    runTests(api, payload, (r) => expect(r).to.have.statusCode(200), tests);
  });
};

exports.forPlatform = (resource, payload, validationCb, tests) => {
  describe(resource, () => {
    let api = util.format('/%s', resource);
    runTests(api, payload, validationCb, tests);
  });
};
