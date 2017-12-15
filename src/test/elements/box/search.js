'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const faker = require('faker');
const tools = require('core/tools');
let payload = tools.requirePayload(`${__dirname}/assets/customFields.json`);
const temPayload = tools.requirePayload(`${__dirname}/assets/template.json`);
const lock = () => ({
  "is_download_prevented": false,
  "expires_at": "2030-12-12T10:55:30-08:00"
});



suite.forElement('documents', 'search', null, (test) => {
  afterEach(done => {
    //We were getting a 429 before this
    setTimeout(done, 2500);
  });


  it('should support template filtering for GET /search', () => {
    let folderPath = '/TestFolderDoNoDelete'
    let searchWhereClause =  `path = '${folderPath}' and template_templateKey= 'customer' and template_scope = 'enterprise' and template_category1234 = 'saucyChurros'`;
    
    return cloud.withOptions({qs: {path :folderPath}}).get(`/folders/contents`)
    .then(r => expect(r.body.length).to.be.at.least(2))
    .then(() => cloud.withOptions({qs:{where: searchWhereClause}}).get(test.api))
    .then(r => {
      expect(r.body.length).to.equal(1);
    })
  });
});