'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const swaggerParser = require('swagger-parser');
const expect = require('chakram').expect;

suite.forPlatform('docs', {skip: false}, () => {
  let hubs, elements;

  before(() => cloud.get('/elements')
    .then(r => {
      elements = r.body.reduce((p, c) => {
        if (c.active) {
          p.push({id: c.id, key: c.key});
        }
        return p;
      }, []);

      hubs = r.body.reduce((p, c) => {
        if (c.active) { p.push(c.hub); }
        return p;
      }, []);
    }));

  // Skipping this test as the hubs swagger is not validated { skip: true }
  it.skip('should return proper swagger json for hubs', () => {
    return Promise.all(hubs.map(h => {
      return cloud.get(`/docs/${h}`)
        .then(r => r.body)
        .then(s => swaggerParser.validate(s, (err, api) => {
          if (err) { throw new Error(`Docs for '${h}' hub are invalid Swagger: ${err}`); }
        }));
    }));
  });

  it.skip('should return proper swagger json for elements', () => {
    let failures = [];
    return Promise.all(elements.map(element => {
      return cloud.get(`/elements/${element.id}/docs`)
        .then(r => r.body)
        .then(s => {
          return new Promise(function(resolve, reject) {
            swaggerParser.validate(s, (err, api) => {
              if (err) {
                reject(err);
              }
              resolve();
            });
          });
        })
        .catch((err) => failures.push({ id: element.id, error: err, key: element.key}));
    })).then(() => expect(failures).to.deep.equal([]));
  });

  it('should return proper swagger json for AWS provider', () => {
    return cloud.get(`/docs/crm?provider=aws`)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.paths['/accounts'].get.parameters[1].name).to.equal('x-api-key');
        expect(r.body.host).to.equal('aws-api.cloud-elements.com');
        expect(r.body.basePath).to.not.have.string('/elements/api-v2');
      });
  });

  it('should return proper swagger json with the provided base URL', () => {
    return cloud.withOptions({ qs: { baseUrl: 'https://foo.bar' } }).get(`/docs/crm`)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body.host).to.equal('foo.bar');
        expect(r.body.schemes).to.contain('https');
      });
  });


  it('should return proper swagger json for a given version for the element ', () => {
    let version;
    return cloud.get(`/elements/${elements[0].id}/versions`)
      .then(r => version = r.body[0].version)
      .then(() => cloud.withOptions({ qs: { 'version': `${version}` } }).get(`/elements/${elements[0].id}/docs`));
  });
});
