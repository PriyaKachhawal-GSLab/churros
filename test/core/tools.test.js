'use strict';

const chai = require('chai');
const expect = chai.expect;
const tools = require('core/tools');

describe('tools', () => {
  it('should support generating a random string', () => {
    const random = tools.random();
    expect(random).to.be.a('string');
  });

  it('should support generating a random string', () => {
    const random = tools.randomStr("aAeEiIoOuU", 4);
    expect(random).to.be.a('string');
    expect(random).to.have.lengthOf(4);
  });

  it('should support generating a random string without inputs', () => {
    const random = tools.randomStr();
    expect(random).to.be.a('string');
    expect(random).to.have.lengthOf(8);
  });

  it('should support generating a random string with only a number', () => {
    const random = tools.randomStr(5);
    expect(random).to.be.a('string');
    expect(random).to.have.lengthOf(5);
  });

  it('should support generating a random string with only a string', () => {
    const random = tools.randomStr("aAeEiIoOuU");
    expect(random).to.be.a('string');
    expect(random).to.have.lengthOf(8);
  });

  it('should support generating a random string even when length is 0', () => {
    const random = tools.randomStr("aAeEiIoOuU", 0);
    expect(random).to.be.a('string');
    expect(random).to.have.lengthOf(8);
  });

  it('should support generating a random string with null inputs', () => {
    const random = tools.randomStr(null, "aAeEiIoOuU");
    expect(random).to.be.a('string');
    expect(random).to.have.lengthOf(8);
  });

  it('should support generating a random email address', () => {
    const random = tools.randomEmail();
    expect(random).to.be.a('string');
    expect(random).to.include('@');
    expect(random).to.include('.com');
  });

  it('should support generating a random int', () => {
    const randomInt = tools.randomInt();
    expect(randomInt).to.be.a('number');
  });

  it('should support logging and throwing an error with an arg', () => {
    try {
      tools.logAndThrow('churros are tasty %s', Error, '1');
    } catch (e) {
      return true;
    }
    throw Error('oops...');
  });

  it('should support logging and throwing an error without an arg', () => {
    try {
      tools.logAndThrow('churros are tasty 1', Error);
    } catch (e) {
      return true;
    }
    throw Error('oops...');
  });

  it('should support encoding a string to base64', () => {
    const encoded = tools.base64Encode('ABCD');
    expect(encoded).to.be.a('string');
    expect(encoded).to.equal('QUJDRA==');
  });

  it('should support decoding a base64 value to a string', () => {
    const encoded = tools.base64Decode('QUJDRA==');
    expect(encoded).to.be.a('string');
    expect(encoded).to.equal('ABCD');
  });

  it('should support sleeping for x seconds', () => tools.sleep(1));

  it('should support waiting until a specific time for a succesful predicate', () => {
    let i = 0;
    const pred = () => new Promise((res, rej) => ++i > 2 ? res(true) : rej());
    return tools.wait.until(10000, 2000).for(pred)
      .then(r => expect(r).to.equal(true));
  });

  it('should support waiting until a specific time for an unsuccesful predicate', () => {
    const pred = () => new Promise((res, rej) => rej());
    return tools.wait.until(10000, 5000).for(pred)
      .then(r => {
        throw Error('Failed');
      })
      .catch(e => true);
  });

  it('should support waiting a specific time for a succesful predicate', () => {
    let i = 0;
    const pred = () => new Promise((res, rej) => ++i > 2 ? res(true) : rej());
    return tools.wait.upTo(10000).for(pred)
      .then(r => expect(r).to.equal(true));
  });

  it('should support waiting for a specific time for an unsuccesful predicate', () => {
    const pred = () => new Promise((res, rej) => rej());
    return tools.wait.upTo(1000).for(pred)
      .then(r => {
        throw Error('Failed');
      })
      .catch(e => true);
  });

  it('should support waiting the default time for a succesful predicate', () => {
    let i = 0;
    const pred = () => new Promise((res, rej) => ++i > 2 ? res(true) : rej());
    return tools.wait.for(pred)
      .then(r => expect(r).to.equal(true));
  });

  it('should support waiting for the default time for an unsuccesful predicate', () => {
    const pred = () => new Promise((res, rej) => rej(false));
    return tools.wait.for(pred)
      .then(r => {
        throw Error('Failed');
      })
      .catch(r => true);
  });

  it('should allow stringifying an object', () => tools.stringify({ foo: 'bar' }));

  it('should allow loading an asset file', () => tools.copyAsset(require.resolve('./assets/test.json')));

  it('should allow running a function x number of times', () => {
    const res = tools.times(5)(() => 'foo');
    expect(res).to.have.length(5);
    res.map(r => expect(r).to.equal('foo'));
  });
  it('should run a script file', () => {
    return tools.runFile('foo', `${__dirname}/assets/testScripts.js`, 'bar')
    .then(r => expect(r).to.equal('foo:bar'))
    .then(r => tools.runFile('foo', './fake/file/path', 'bar'))
    .then(r => expect(r).to.equal(null));
  });
  it('should get base element', () => {
    const element = 'hubspot--oauth2';
    const baseElement = 'hubspot';
    return expect(tools.getBaseElement(element)).to.equal(baseElement);
  });
  it('should update metadata', () => {
    const OGmetadata = { qs: { q: 'select * from contacts where city = \'Tampa\'' } };
    const updatedMetadata = { qs: { q: 'select * from contacts where city = \'Tampa\'', where: 'city = \'Tampa\'' } };
    return expect(tools.updateMetadata(OGmetadata)).to.deep.equal(updatedMetadata);
  });
  it('should fail metadata', () => {
    const OGmetadata = null;
    const updatedMetadata = null;
    expect(tools.updateMetadata(OGmetadata)).to.deep.equal(updatedMetadata);

    const OGmetadata1 = {};
    const updatedMetadata1 = {};
    expect(tools.updateMetadata(OGmetadata1)).to.deep.equal(updatedMetadata1);

    const OGmetadata2 = { qs: {} };
    const updatedMetadata2 = { qs: { where: ''}};
    expect(tools.updateMetadata(OGmetadata2)).to.deep.equal(updatedMetadata2);
  });

  it('should get limit from CEQL query', () => {
    const limitMetadata = { qs: { q: 'select * from contacts limit 100' } };
    expect(tools.getLimit(limitMetadata)).to.deep.equal(100);

    const noLimitMetadata = { qs: { q: 'select * from contacts' } };
    expect(tools.getLimit(noLimitMetadata)).to.deep.equal(-1);

    const whereLimitMetadata1 = { qs: { q: 'select * from contacts where city = \'Tampa\' limit 100' } };
    expect(tools.getLimit(whereLimitMetadata1)).to.deep.equal(100);

    const whereLimitMetadata2 = { qs: { q: 'select * from contacts limit 100 where city = \'Tampa\'' } };
    expect(tools.getLimit(whereLimitMetadata2)).to.deep.equal(100);
  });
  it('should fail limit', () => {
    const OGmetadata = null;
    expect(tools.getLimit(OGmetadata)).to.deep.equal(-1);

    const OGmetadata1 = {};
    expect(tools.getLimit(OGmetadata1)).to.deep.equal(-1);

    const OGmetadata2 = { qs: {} };
    expect(tools.getLimit(OGmetadata2)).to.deep.equal(-1);
  });
  it('should pass isJsonL', () => {
    const jsonL = `{ "key1": "value" }\n{ "key2": "value" }`;
    expect(tools.isJsonL(jsonL)).to.be.true;
  });
  it('should fail isJsonL', () => {
    const json = `{ "key": "value" }`;
    expect(tools.isJsonL(JSON.parse(json))).to.be.false;

    const jsonArray = `[{ "key1": "value" },{ "key2": "value" }]`;
    expect(tools.isJsonL(JSON.parse(jsonArray))).to.be.false;
  });
  it('should get proper json from getJsonL', () => {
    const expectedJson = `[{ "key1": "value" },{ "key2": "value" }]`;
    const jsonL = `{ "key1": "value" }\n{ "key2": "value" }`;
    expect(tools.getJsonL(jsonL)).to.deep.equal(JSON.parse(expectedJson));
  });
  it('should handle err from getJsonL', () => {
    const expected = ['', ''];
    const jsonL = `{1}\n{2}`;
    expect(tools.getJsonL(jsonL)).to.deep.equal(expected);
  });
  it('should pass getJson', () => {
    const jsonArray = `[{ "key1": "value" },{ "key2": "value" }]`;
    const jsonL = `{ "key1": "value" }\n{ "key2": "value" }`;
    const expectedJson = JSON.parse(jsonArray);
    expect(tools.getJson(jsonArray)).to.deep.equal(expectedJson);
    expect(tools.getJson(jsonL)).to.deep.equal(expectedJson);
    expect(tools.getJson(expectedJson)).to.deep.equal(expectedJson);
  });
  it('should fail getJson', () => {
    expect(tools.getJson(1231)).to.be.null;
    expect(tools.getJson(null)).to.be.null;
    expect(tools.getJson(undefined)).to.be.null;
  });

  it('should get fields from transformations file', () => {
    const element = 'netsuitefinancev2';
    const objectName = 'bulkCustomerNfv2';
    const fields = ['id', 'bulk-lastModifiedDate', 'bulk-dateCreated'];
    expect(tools.getFieldsFromTransformation(element, objectName)).to.deep.equal(fields);
  });
  it('should fail get fields from transformations file', () => {
    const element = 'netsuitefinancev2';
    const objectName = 'nah';
    expect(tools.getFieldsFromTransformation(element, objectName)).to.deep.equal(null);
  });
  it('should get reduced response from getFieldsMap', () => {
    const body = [{"id":"1","firstName":"t1","lastName":"to1","junk1":"a","junk2":"b"},{"id":"2","firstName":"t2","lastName":"to2","junk1":"a","junk2":"b"},{"id":"3","firstName":"t3","lastName":"to3","junk1":"a","junk2":"b"}];
    const fields = ['id', 'firstName', 'lastName'];
    const result = [{"firstName":"t1","id":"1","lastName":"to1"},{"firstName":"t2","id":"2","lastName":"to2"},{"firstName":"t3","id":"3","lastName":"to3"}];
    expect(tools.getFieldsMap(body, fields)).to.deep.equal(result);
  });
  it('should parse csv', () => {
    const before = `firstName,lastName,id
Austin,Mahan,12
Josh,Wyse,2
`;
    const after = [{firstName:'Austin', lastName:'Mahan', id: '12'},{firstName:'Josh', lastName:'Wyse', id: '2'}];
    expect(tools.csvParse(before)).to.deep.equal(after);
  });
  it('should create where expression from object', () => {
    const obj = {firstName:'Austin', lastName:'Mahan', id: '12'};
    const where = `firstName = 'Austin' AND lastName = 'Mahan' AND id = '12'`;
    expect(tools.createExpression(obj)).to.equal(where);
  });
  it('should get the key value on top layer', () => {
    const obj = {id: 'randoId', name: 'Austin'};
    expect(tools.getKey(obj, 'id')).to.deep.equal(['randoId']);
  });
  it('should get the key value from complex structures', () => {
    const obj = [[{user: {ids: {id: "someId"}}},[{id:"nextId"}]],{allPeeps: [[{user1: {anotherfield: {stuff: [{id: "lastId"}]}}}]]}];
    expect(tools.getKey(obj, 'id')).to.deep.equal(['someId', 'nextId', 'lastId']);
  });
  it('should return empty array if object is not a Object', () => {
    expect(tools.getKey('', 'id')).to.deep.equal([]);
  });
  it('should require a JSON payload with no changes', () => {
    const regular = require(`${__dirname}/assets/test.json`);
    const modified = tools.requirePayload(`${__dirname}/assets/test.json`);
    expect(modified).to.deep.equal(regular);
  });
  it('should require a JSON payload with changes', () => {
    const regular = require(`${__dirname}/assets/testPayload.json`);
    const modified = tools.requirePayload(`${__dirname}/assets/testPayload.json`);
    expect(modified).to.not.deep.equal(regular);
  });
  it('should throw error with bad path', () => {
    const fn = () => tools.requirePayload(`${__dirname}/assets/BadPath.json`);
    expect(fn).to.throw(Error);
  });
  it('should reset and get cleanup file', () => {
    tools.resetCleanup();
    setTimeout(() => expect(tools.getCleanup()).to.equal([]), 1000);
  });
  it('should add to cleanup file', () => {
    tools.resetCleanup();
    tools.addCleanUp({url:'http://google.com', method: 'get', secrets: {}});
    setTimeout(() => expect(tools.getCleanup()).to.deep.equal([{url:'http://google.com', method: 'get', secrets: {}}]), 1000);
  });

  it('should support findInArray', () => {
    const items = [
      {
        id: 123,
        name: 'josh'
      },
      {
        id: 456,
        name: 'lebron'
      }
    ];
    const lebron = tools.findInArray(items, 'name', 'lebron');
    expect(lebron).to.deep.equal(items[1]);

    const u = tools.findInArray(items, 'name', 'foo');
    expect(u).to.be.undefined;
  });
});
