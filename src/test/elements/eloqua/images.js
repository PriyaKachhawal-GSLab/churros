'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const imagesUpdatePayload = tools.requirePayload(`${__dirname}/assets/images-update.json`);


let jpgFile = __dirname + '/assets/brady.jpg';
let query = { depth: 'complete' };
suite.forElement('marketing', 'images', (test) => {

  it('should allow CRUDS for iamges', () => {
    let jpgFileBody;
    return cloud.postFile(test.api, jpgFile)
      .then(r => jpgFileBody = r.body)
      .then(() => cloud.get('/hubs/documents/images'))
      .then(() => cloud.get(`/hubs/documents/images/${jpgFileBody.id}`))
      .then(r => cloud.withOptions({ qs: { where: `name = '${jpgFileBody.name}'` } }).get(`/hubs/documents/images`))
      .then(r => {
        expect(r).to.statusCode(200);
        expect(r.body).to.not.be.empty;
        expect(r.body.name = `${jpgFileBody.name}`);
      })
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 1 } }).get(`/hubs/documents/images`))
      .then(r => {
        expect(r).to.statusCode(200);
        expect(r.body.length = 1);
      })
      .then(() => cloud.patch(`/hubs/documents/images/${jpgFileBody.id}`, imagesUpdatePayload))
      .then(() => cloud.delete(`/hubs/documents/images/${jpgFileBody.id}`));
  });

});
