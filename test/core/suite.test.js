'use strict';

require('core/assertions');
const suite = require('core/suite');
const chakram = require('chakram');
const expect = chakram.expect;
const helper = require('./assets/suite-helper');
const genPayload = helper.genPayload;
const genSchema = helper.genSchema;

const baseUrl = 'https://api.cloud-elements.com/elements/api-v2;';
const auth = 'User fake, Organization fake';
const eiId = 789;

const headers = () => new Object({ reqheaders: { 'Authorization': (value) => value === auth } });

const eventHeaders = () => new Object({
  reqheaders: {
    'Authorization': (value) => value === auth,
    'Element-Instances': (value) => value === eiId
  }
});

describe('suite', () => {
  /** Before tests run, set up the default chakram headers */
  before(() => {
    chakram.setRequestDefaults({
      baseUrl: baseUrl,
      headers: { Authorization: auth }
    });
  });

  /** Before each, reset the nock endpoints...have to do it beforeEach because: https://github.com/pgte/nock#specifying-hostname */
  beforeEach(() => helper.mock(baseUrl, headers, eventHeaders));

  /* Not passing in any suite options */
  suite.forElement('fakehub', 'resource', (test) => {
    it('should support suite for element', () => expect(test.api).to.equal('/hubs/fakehub/resource'));
  });

  /* Not passing in any suite options */
  suite.forPlatform('platformresource', (test) => {
    it('should support suite for platform', () => expect(test.api).to.equal('/platformresource'));
  });

  /* Passing in payload and schema options, which are the defaults used, unless overridden, for all tests inside suite */
  suite.forPlatform('foo', { payload: genPayload(), schema: genSchema() }, (test) => {
    /* all of these are equivalent just as examples */
    test.should.return200OnPost();
    test
      .withApi('/foo')
      .should.return200OnPost();
    test
      .withJson(genPayload())
      .should.return200OnPost();
    test
      .withValidation(genSchema())
      .should.return200OnPost();
    test
      .withApi('/foo')
      .withJson(genPayload())
      .withValidation(genSchema())
      .should.return200OnPost();
    test
      .withJson(genPayload())
      .withValidation(genSchema())
      .withApi('/foo')
      .should.return200OnPost();
    test
      .withOptions({})
      .should.return200OnPost();
    test
      .withApi('/foo')
      .withOptions({})
      .should.return200OnPost();

    /* all of these are equivalent just as examples */
    test.should.return404OnPatch(456);
    test
      .withApi(`${test.api}/456`)
      .should.return404OnPatch();

    /* with options, extends the request libraries options object */
    test
      .withOptions({ qs: { page: 1, pageSize: 1 } })
      .should.return200OnGet();

    /* withApi overrides the default api that was passed in to the `suite.forPlatform` above */
    test
      .withApi(`${test.api}/456`)
      .should.return404OnGet();
    test
      .withApi('/foo/456')
      .should.return404OnPut();
    test
      .withApi('/foo/456')
      .should.return404OnDelete();
    test
      .withApi('/foo/pagination')
      .should.supportNextPagePagination(1, true);
    test
      .withApi('/foo/pagination')
      .should.supportNextPagePagination(1);

    test
      .withApi('/foo/pagination')
      .should.supportPagination();

    /* no with... functions, which will just use the defaults that were passed in to the `suite.forPlatform` above */
    test.should.return200OnPost();
    test.should.return404OnGet(456);
    test.should.supportSr();
    test.should.supportS();
    test.should.supportCruds();
    test.should.supportCruds(chakram.put);
    test.should.supportCrud();
    test.should.supportCrus();
    test.should.supportCrd();
    test.should.supportCd();
    test.should.supportCrds();
    test.should.supportCrs();
    test.should.supportCr();
    test.should.supportCs();
    test.should.supportCeqlSearch('id');
    test.should.supportCeqlSearchForMultipleRecords('id');
    test.should.supportBulkUpload(null, null, `${__dirname}/assets/test.json`, '/bulk');
    test.should.supportBulkDownload(null, {json: true, csv: true}, 'endpoint', '/bulk');

    /* overriding the default API that was passed in as the default in the `suite.forPlatform` */
    test
      .withApi('/foo/bad')
      .should.return400OnPost();
    test
      .withApi('/foo/conflict')
      .should.return409OnPost();

    /* examples of using .withName(...) which will set the name of the test to be whatever string is passed in */
    test
      .withName('this should be the name of the test')
      .should.return200OnPost();

    test
      .withApi('/foo/bad')
      .withName('this should be the name of the test')
      .should.return400OnPost();

    test
      .withName('should allow overriding the api and the options with new values')
      .withApi(`${test.api}/search`)
      .withOptions({ qs: { foo: 'bar' } })
      .should.return200OnGet();

    test
      .withName('should allow skipping a specific test by passing in the skip option')
      .withOptions({ skip: true })
      .withApi(`${test.api}/api/that/is/not/mocked`)
      .should.return200OnGet();
  });
});

/* This test exercises some of the available optional suite options */
const opts = {
  name: 'this will override the resource that was passed in',
  payload: genPayload(),
  schema: genSchema()
};
suite.forPlatform('exampleResourceName', opts, (test) => {});

const optsWithSkip = {
  skip: true
};
suite.forPlatform('resourceNameThatWillBeSkipped', optsWithSkip, (test) => {});
