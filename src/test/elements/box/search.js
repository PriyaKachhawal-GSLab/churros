'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('documents', 'search', null, (test) => {
  afterEach(done => {
    //We were getting a 429 before this
    setTimeout(done, 2500);
  });

  test.withOptions({qs: {text:'test', path: '/'}}).should.return200OnGet();
  test.should.supportNextPagePagination(1);
  it('should support template filtering for GET /search', () => {
    let folderPath = '/TestFolderDoNotDelete';
    let searchWhereClause =  `path = '${folderPath}' and template_templateKey= 'customer' and template_scope = 'enterprise' and template_category1234 = 'saucyChurros'`;
    
    return cloud.withOptions({qs: {path :folderPath}}).get(`/folders/contents`)
    .then(r => expect(r.body.length).to.be.at.least(2))
    .then(() => cloud.withOptions({qs:{where: searchWhereClause}}).get(test.api))
    .then(r => {
      expect(r.body.length).to.equal(1);
    });
  });
});