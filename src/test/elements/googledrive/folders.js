'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const expect = require('chakram').expect;
const faker = require('faker');
const payload = require('./assets/folders');
const updatePayload = {
  path: `/${tools.random()}`
};

suite.forElement('documents', 'folders', { payload: payload }, (test) => {
  let directoryPath = faker.random.uuid(),
    directoryId;
  let jpgFile = __dirname + '/assets/Penguins.jpg';
  let pngFile = __dirname + '/assets/Dice.png';
  let textFile = __dirname + '/assets/textFile.txt';
  let jpgFileBody, pngFileBody, textFileBody, date1, date2;

  before(() =>
    cloud.withOptions({ qs: { path: `/${directoryPath}/Penguins.jpg`, overwrite: 'true' } }).postFile(`/hubs/documents/files`, jpgFile)
    .then(r => jpgFileBody = r.body)
    .then(() => cloud.withOptions({ qs: { path: `/${directoryPath}/Dice.png`, overwrite: 'true' } }).postFile(`/hubs/documents/files`, pngFile))
    .then(r => pngFileBody = r.body)
    .then(() => cloud.withOptions({ qs: { path: `/${directoryPath}/textFile.txt`, overwrite: 'true' } }).postFile(`/hubs/documents/files`, textFile))
    .then(r => textFileBody = r.body)
    .then(() => cloud.withOptions({ qs: { path: `/${directoryPath}` } }).get(`${test.api}/metadata`))
    .then(r => directoryId = r.body.id));

  after(() => cloud.withOptions({ qs: { path: `/${directoryPath}` } }).delete(`/hubs/documents/folders`));

  it('should allow CRD for hubs/documents/folders and RU for hubs/documents/folders/metadata by path', () => {
    let srcPath, destPath;
    return cloud.post(`${test.api}`, payload)
      .then(r => {
            srcPath = r.body.path;
            expect(r.body.properties.thumbnailLink).to.be.undefined;
            expect(r.body.properties.mimeType).to.be.undefined;
          })
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/contents`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}`, page: 1, pageSize: 1 } }).get(`${test.api}/contents`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).post(`${test.api}/copy`, updatePayload))
      .then(r => destPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).get(`${test.api}/metadata`))
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).patch(`${test.api}/metadata`, updatePayload))
      .then(r => srcPath = r.body.path)
      .then(r => cloud.withOptions({ qs: { path: `${srcPath}` } }).delete(`${test.api}`))
      .then(r => cloud.withOptions({ qs: { path: `${destPath}` } }).delete(`${test.api}`));
  });

  it('should allow CRD for hubs/documents/folders and RU for hubs/documents/folders/metadata by id', () => {
    let folderId, destPath;
    return cloud.post(`${test.api}`, payload)
      .then(r => folderId = r.body.id)
      .then(r => cloud.get(`${test.api}/${folderId}/contents`))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${folderId}/contents`))
      .then(r => cloud.post(`${test.api}/${folderId}/copy`, updatePayload))
      .then(r => destPath = r.body.path)
      .then(r => cloud.get(`${test.api}/${folderId}/metadata`))
      .then(r => cloud.patch(`${test.api}/${folderId}/metadata`, updatePayload))
      .then(r => folderId = r.body.id)
      .then(r => cloud.delete(`${test.api}/${folderId}`))
      .then(r => cloud.withOptions({ qs: { path: `${destPath}` } }).delete(`${test.api}`));
  });

  it('should allow GET /folders/contents', () => {
    return cloud.withOptions({ qs: { path: `/${directoryPath}` } }).get(`${test.api}/contents`);
  });

  it('should allow GET /folders/contents with name like', () => {
    return cloud.withOptions({ qs: { path: `/${directoryPath}`, where: "name like 'Dice'" } }).get(`${test.api}/contents`)
      .then(r => expect(r.body[0].name).to.contain('Dice'));
  });

  it('should allow GET /folders/contents with name equals', () => {
    return cloud.withOptions({ qs: { path: `/${directoryPath}`, where: "name='Penguins.jpg'" } }).get(`${test.api}/contents`)
      .then(r => expect(r.body[0].name).to.equal("Penguins.jpg"));
  });

  it('should allow GET /folders/contents with name IN', () => {
    return cloud.withOptions({ qs: { path: `/${directoryPath}`, where: "name IN ('Penguins.jpg','Dice.png')" } }).get(`${test.api}/contents`)
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.name === 'Penguins.jpg' || obj.name === 'Dice.png').length));
  });

  it('should allow GET /folders/contents with extension', () => {
    return cloud.withOptions({ qs: { path: `/${directoryPath}`, where: "extension='txt'" } }).get(`${test.api}/contents`)
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.properties.mimeType === 'text/plain').length));
  });

  it('should allow GET /folders/contents with mimeType', () => {
    return cloud.withOptions({ qs: { path: `/${directoryPath}`, where: "mimeType='text/plain'" } }).get(`${test.api}/contents`)
      .then(r => expect(r.body.length).to.equal(r.body.filter(obj => obj.properties.mimeType === 'text/plain').length));
  });

  test.withApi(`/folders/contents`)
    .withName(`should allow GET for /folders/contents with orderBy modifiedDate asc`)
    .withOptions({ qs: { path: `/`, pageSize: 5, page: 1, orderBy: `modifiedDate asc`, calculateFolderPath: false } })
    .withValidation(r => {
      expect(r).to.have.statusCode(200);
      date1 = new Date(r.body[0].modifiedDate).getTime();
      date2 = new Date(r.body[1].modifiedDate).getTime();
      expect(date1 <= date2).to.be.true;
    })
    .should.return200OnGet();

  test.withApi(`${test.api}/root/contents`)
      .withName(`should allow GET for /folders/contents with orderBy createdDate desc`)
      .withOptions({ qs: {  pageSize: 5, page: 1, orderBy: `createdDate desc`, calculateFolderPath: false } })
      .withValidation(r => {
        expect(r).to.have.statusCode(200);
        date1 = new Date(r.body[0].createdDate).getTime();
        date2 = new Date(r.body[1].createdDate).getTime();
        expect(date1 >= date2).to.be.true;
      })
      .should.return200OnGet();

  test.withOptions({ qs: { path: '/' } }).withApi('/folders/contents').should.supportPagination('id');

});
