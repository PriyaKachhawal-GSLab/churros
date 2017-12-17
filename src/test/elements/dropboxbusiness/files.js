'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const faker = require('faker');
const props = require('core/props');
const expect = require('chakram').expect;

suite.forElement('documents', 'files', (test) => {

  let jpgFile = __dirname + '/assets/brady.jpg';
  var jpgFileBody, revisionId;
  let directoryPath = faker.random.word();
  let memberId = props.getForKey('dropboxbusiness', 'username');

  before(() => cloud.withOptions({ qs: { path: `/${directoryPath}/brady.jpg`, headers: { "Elements-As-Team-Member": memberId } } }).postFile(test.api, jpgFile)
    .then(r => jpgFileBody = r.body));

  after(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).delete(`${test.api}/${jpgFileBody.id}`));

  it('it should allow RS for documents/files/:id/revisions', () => {
    return cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).get(`${test.api}/${jpgFileBody.id}/revisions`)
      .then(r => {
        expect(r.body.filter(obj => obj.fileName === 'brady.jpg')).to.not.be.empty;
        revisionId = r.body[0].id;
      })
      .then(() => cloud.withOptions({ headers: { "Elements-As-Team-Member": memberId } }).get(`${test.api}/${jpgFileBody.id}/revisions/${revisionId}`))
      .then(r => expect(r.body.fileName).to.equal("brady.jpg"));
  });

  it('it should allow RS for documents/files/revisions by path', () => {
    return cloud.withOptions({ qs: { path: `/${directoryPath}/brady.jpg` }, headers: { "Elements-As-Team-Member": memberId } }).get(`${test.api}/revisions`)
      .then(r => {
        expect(r.body.filter(obj => obj.fileName === 'brady.jpg')).to.not.be.empty;
        revisionId = r.body[0].id;
      })
      .then(() => cloud.withOptions({ qs: { path: `/${directoryPath}/brady.jpg` }, headers: { "Elements-As-Team-Member": memberId } }).get(`${test.api}/revisions/${revisionId}`))
      .then(r => expect(r.body.fileName).to.equal("brady.jpg"));
  });

});
