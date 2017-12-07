'use strict';

require('core/assertions');
require('core/logger')('error');
const cloud = require('core/cloud');
const nock = require('nock');
const chakram = require('chakram');
const expect = chakram.expect;
const fs = require('fs');

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

const genPayload = (opts) => {
  opts = opts || {};
  return new Object({
    id: (opts.id || null),
    foo: (opts.foo || 'bar')
  });
};

const genEventRequest = (opts) => {
  opts = opts || {};
  return new Object({
    method: (opts.method || 'POST'),
    api: (opts.api || 'events/sfdc'),
    body: '<replaceme>',
    query: {
      replace: '<replaceme>'
    },
    headers: {
      replace: '<replaceme>'
    }
  });
};

const genSchema = () => new Object({
  type: ['object', 'array'],
  properties: {
    id: { type: "number" },
    foo: { type: "string" }
  },
  required: ['id', 'foo']
});

describe('cloud', () => {
  beforeEach(() => {
    chakram.setRequestDefaults({
      baseUrl: baseUrl,
      headers: { Authorization: auth }
    });

    /** MOCKING OUT HTTP ENDPOINTS **/
    /** https://github.com/pgte/nock#specifying-hostname **/

    /** POST **/
    nock(baseUrl, headers())
      .post('/foo')
      .reply(200, (uri, requestBody) => {
        requestBody.id = 123;
        return requestBody;
      })
      .post('/foo/bad')
      .reply(400, (uri, requestBody) => {
        return { message: 'Invalid JSON body' };
      })
      .post('/foo/file')
      .reply(200, (uri, requestBody) => genPayload({ id: 123 }))
      .post('/foo/file/with/multipart')
      .reply(200, (uri, requestBody) => genPayload({ id: 123 }))
      .post('/foo/bad/file')
      .reply(404, (uri, requestBody) => {
        return { message: 'No resource found at /foo/bad/file' };
      });

    nock(baseUrl, eventHeaders())
      .post('/events/myelement')
      .reply(200, (uri, requestBody) => requestBody);

    /** GET **/
    nock(baseUrl, headers())
      .get('/foo/123')
      .reply(200, () => genPayload({ id: 123 }))
      .get('/foo/456')
      .reply(404, () => {
        return { message: 'No foo found with the given ID' };
      })
      .get('/foo/bad')
      .reply(404, () => {
        return { message: 'No resource found with name /foo/bad' };
      })
      .get('/foo')
      .reply(200, (uri, requestBody) => [genPayload({ id: 123 }), genPayload({ id: 456 })])
      .get('/foo')
      .query({ page: '1', pageSize: '1' })
      .reply(200, () => genPayload({ id: 123 }))
      .get('/foo')
      .query({ where: 'id=\'123\'' })
      .reply(200, () => [genPayload({ id: 123 })]);

    /** PATCH && PUT **/
    nock(baseUrl, headers())
      .patch('/foo/123')
      .reply(200, (uri, requestBody) => {
        requestBody.id = 123;
        return requestBody;
      })
      .patch('/foo/123', {
        id: 789,
        foo: 'bar'
      })
      .reply(200, (uri, requestBody) => {
        requestBody.id = 789;
        return requestBody;
      })
      .patch('/foo/456')
      .reply(404, (uri, requestBody) => {
        return { message: 'No foo found with the given ID' };
      })
      .patch('/foo/file')
      .reply(200, (uri, requestBody) => genPayload({ id: 123 }))
      .patch('/foo/bad/file')
      .reply(404, (uri, requestBody) => {
        return { message: 'No resource found at /foo/bad/file' };
      })
      .put('/foo/123')
      .reply(200, (uri, requestBody) => {
        requestBody.id = 123;
        return requestBody;
      })
      .put('/foo/123', {
        id: 789,
        foo: 'bar'
      })
      .reply(200, (uri, requestBody) => {
        requestBody.id = 789;
        return requestBody;
      })
      .put('/foo/456')
      .reply(404, (uri, requestBody) => {
        return { message: 'No foo found with the given ID' };
      })
      .put('/foo/file')
      .reply(200, (uri, requestBody) => genPayload({ id: 123 }))
      .put('/foo/bad/file')
      .reply(404, (uri, requestBody) => {
        return { message: 'No resource found at /foo/bad/file' };
      });

    /** DELETE **/
    nock(baseUrl, headers())
      .delete('/foo/123')
      .reply(200, (uri, requestBody) => {
        return {};
      });
  });

  it('should support post', () => cloud.post('/foo', genPayload(), genSchema()));
  it('should support post with options', () => cloud.withOptions({ json: true }).post('/foo', genPayload(), genSchema()));
  it('should support post with custom validation', () => cloud.post('/foo/bad', {}, (r) => expect(r).to.have.statusCode(400)));
  it('should support post with no custom validation', () => cloud.post('/foo', genPayload()));
  it('should throw an error if post validation fails', () => {
    return cloud.post('/foo/bad', {}, (r) => expect(r).to.have.statusCode(200))
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => true);
  });

  it('should support get', () => cloud.get('/foo/123', genSchema()));
  it('should support get with options', () => cloud.withOptions({ json: true }).get('/foo/123', genSchema()));
  it('should support get with custom validation', () => cloud.get('/foo/456', (r) => expect(r).to.have.statusCode(404)));
  it('should support get with no custom validation', () => cloud.get('/foo/123'));
  it('should throw an error if get validation fails', () => {
    return cloud.get('/foo/456', (r) => expect(r).to.have.statusCode(200))
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => true);
  });

  it('should support put', () => cloud.put('/foo/123', genPayload(), genSchema()));
  it('should support put with options', () => cloud.withOptions({ json: true }).put('/foo/123', genPayload(), genSchema()));
  it('should support put with custom validation', () => cloud.put('/foo/456', genPayload(), (r) => expect(r).to.have.statusCode(404)));
  it('should support put with alternate payload', () => {
    return cloud.withOptions({ churros: { updatePayload: genPayload({ id: 789 }) } })
      .put('/foo/123', genPayload({ id: 123 }), (r) => expect(r.body.id).to.equal(789));
  });
  it('should support put with no custom validation', () => cloud.put('/foo/123', genPayload()));
  it('should throw an error if put validation fails', () => {
    return cloud.put('/foo/456', genPayload(), (r) => expect(r).to.have.statusCode(200))
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => true);
  });

  it('should support patch', () => cloud.patch('/foo/123', genPayload({ id: 123 }), genSchema()));
  it('should support patch with options', () => cloud.withOptions({ json: true }).patch('/foo/123', genPayload({ id: 123 }), genSchema()));
  it('should support patch with custom validation', () => cloud.patch('/foo/456', genPayload(), (r) => expect(r).to.have.statusCode(404)));
  it('should support patch with alternate payload', () => {
    return cloud.withOptions({ churros: { updatePayload: genPayload({ id: 789 }) } })
      .patch('/foo/123', genPayload({ id: 123 }), (r) => expect(r.body.id).to.equal(789));
  });
  it('should support patch with no custom validation', () => cloud.put('/foo/123', genPayload()));
  it('should throw an error if patch validation fails', () => {
    return cloud.patch('/foo/456', genPayload(), (r) => expect(r).to.have.statusCode(200))
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => true);
  });

  it('should support delete', () => cloud.delete('/foo/123'));
  it('should support delete with options', () => cloud.withOptions({ json: true }).delete('/foo/123'));
  it('should throw an error if delete validation fails', () => {
    return cloud.delete('/foo/456')
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => true);
  });

  it('should support find', () => cloud.get('/foo', genSchema()));
  it('should throw an error if find validation fails', () => {
    return cloud.get('/foo/bad', (r) => expect(r).to.have.statusCode(200))
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => true);
  });

  it('should support crd', () => cloud.crd('/foo', genPayload(), genSchema()));
  it('should support crds', () => cloud.crds('/foo', genPayload(), genSchema()));
  it('should support crud', () => cloud.crud('/foo', genPayload(), genSchema()));
  it('should support cruds', () => cloud.cruds('/foo', genPayload(), genSchema()));
  it('should support crd with options', () => cloud.withOptions({ json: true }).crd('/foo', genPayload(), genSchema()));
  it('should support crds with options', () => cloud.withOptions({ json: true }).crds('/foo', genPayload(), genSchema()));
  it('should support crud with options', () => cloud.withOptions({ json: true }).crud('/foo', genPayload(), genSchema()));
  it('should support cruds with options', () => cloud.withOptions({ json: true }).cruds('/foo', genPayload(), genSchema()));
  it('should support creating events', () => {
    cloud.createEvents('myelement', { '<replaceme>': 'foo' }, genEventRequest(), 2)
      .then(r => cloud.createEvents('myelement', {}, genEventRequest({ method: 'GET' }), 2));
  });

  it('should support sr', () => cloud.sr('/foo', (r) => expect(r).to.have.statusCode(200)));
  it('should support sr with options', () => cloud.withOptions({ json: true }).sr('/foo', (r) => expect(r).to.have.statusCode(200)));

  it('should support crs', () => cloud.crs('/foo', genPayload(), genSchema()));
  it('should support crs with options', () => cloud.withOptions({ json: true }).crs('/foo', genPayload(), genSchema()));

  it('should support cr', () => cloud.cr('/foo', genPayload(), genSchema()));
  it('should support cr with options', () => cloud.withOptions({ json: true }).cr('/foo', genPayload(), genSchema()));

  it('should support cs', () => cloud.cs('/foo', genPayload(), genSchema()));
  it('should support cs with options', () => cloud.withOptions({ json: true }).cs('/foo', genPayload(), genSchema()));

  it('should support post file', () => {
    // should really NOT depend on the file system here :/
    const filePath = '.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.postFile('/foo/file', filePath)
      .then(r => fs.unlink(filePath));
  });

  it('should support post file with options', () => {
    // should really NOT depend on the file system here :/
    const filePath = '.post1.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.withOptions({ json: false }).postFile('/foo/file', filePath)
      .then(r => fs.unlink(filePath));
  });

  it('should support post file with form data options', () => {
    const options = { formData: { field: '{\"foo\":\"bar\"}' } };
    const filePath = '.post1.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.withOptions(options).postFile('/foo/file/with/multipart', filePath)
      .then(r => fs.unlink(filePath));
  });

  it('should throw an error if post file validation fails', () => {
    const filePath = '.post2.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.postFile('/foo/bad/file', filePath)
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => {
        fs.unlink(filePath);
        return true;
      });
  });

  it('should support patch file', () => {
    // should really NOT depend on the file system here :/
    const filePath = '.patch1.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.patchFile('/foo/file', filePath)
      .then(r => fs.unlink(filePath));
  });

  it('should support patch file with options', () => {
    // should really NOT depend on the file system here :/
    const filePath = '.patch2.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.withOptions({ json: false }).patchFile('/foo/file', filePath)
      .then(r => fs.unlink(filePath));
  });

  it('should throw an error if patch file validation fails', () => {
    const filePath = '.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.patchFile('/foo/bad/file', filePath)
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => {
        fs.unlink(filePath);
        return true;
      });
  });
 it('should support put file', () => {
    // should really NOT depend on the file system here :/
    const filePath = '.put1.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.putFile('/foo/file', filePath)
      .then(r => fs.unlink(filePath));
  });

  it('should support put file with options', () => {
    // should really NOT depend on the file system here :/
    const filePath = '.put2.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.withOptions({ json: false }).putFile('/foo/file', filePath)
      .then(r => fs.unlink(filePath));
  });

  it('should support withOptions with options', () => {
    return cloud.withOptions({ json: true }).withOptions({ json: false });
  });

  it('should throw an error if put file validation fails', () => {
    const filePath = '.tmp';
    fs.closeSync(fs.openSync(filePath, 'w'));
    return cloud.putFile('/foo/bad/file', filePath)
      .then(r => {
        throw Error('Where my error at?');
      })
      .catch(r => {
        fs.unlink(filePath);
        return true;
      });
  });
});
