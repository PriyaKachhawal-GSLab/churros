    'use strict';

    const suite = require('core/suite');
    const cloud = require('core/cloud');
    const logger = require('winston');
    const tools = require('core/tools');

    suite.forElement('documents', 'folders', (test) => {
      const contentsApi = test.api + '/contents';
      const metadataApi = test.api + '/metadata';
      const options1ApiPaging = { qs: { path: '/', page: 1, pageSize: 1 } };
      const options1ApiPagingAndDetails = { qs: { path: '/', details: true, page: 1, pageSize: 1 } };
      const options2ApiPaging = { qs: { path: '/churros', page: 1, pageSize: 1 } };
      const options2ApiPagingAndDetails = { qs: { path: '/churros', details: true, page: 1, pageSize: 1 } };
      let churrosFolderId = '/058i0000000bw8vAAA';
      const contentsIdApi = test.api + churrosFolderId + '/contents';
      const metadataIdApi = test.api + churrosFolderId + '/metadata';

      test.withApi(contentsApi).withOptions({qs: {path :'/'}}).should.supportNextPagePagination(1);
      test.withOptions({ qs: { path: '/' } }).withApi(contentsApi).should.return200OnGet();
      test.withOptions(options1ApiPaging).withApi(contentsApi).should.return200OnGet();
      test.withOptions({ qs: { path: '/', details: true } }).withApi(contentsApi).should.return200OnGet();
      test.withOptions(options1ApiPagingAndDetails).withApi(contentsApi).should.return200OnGet();
      test.withOptions({ qs: { path: '/churros' } }).withApi(contentsApi).should.return200OnGet();
      test.withOptions(options2ApiPaging).withApi(contentsApi).should.return200OnGet();
      test.withOptions({ qs: { path: '/churros', details: true } }).withApi(contentsApi).should.return200OnGet();
      test.withOptions(options2ApiPagingAndDetails).withApi(contentsApi).should.return200OnGet();
      test.withApi(contentsIdApi).should.return200OnGet();
      test.withApi(contentsIdApi).should.supportPagination();
      test.withOptions({ qs: { details: true } }).withApi(contentsIdApi).should.return200OnGet();
      test.withOptions({ qs: { details: true, page: 1, pageSize: 1 } }).withApi(contentsIdApi).should.return200OnGet();
      test.withOptions({ qs: { path: '/churros' } }).withApi(metadataApi).should.return200OnGet();
      test.withApi(metadataIdApi).should.return200OnGet();

      it('should sort folder contents by file name', () => {
        let ascQuery = { path: '/', orderBy: 'name asc' };
        let descQuery = { path: '/', orderBy: 'name desc' };
        const validateContents = (name, files) => {
          logger.debug(`File[0]: ${tools.stringify(files[0])}`);
          if (files[0].name === name) {
            return true;
          } else {
            return false;
          }
        };

        return cloud.withOptions({ qs: ascQuery }).get(contentsApi)
          .then(r => validateContents('aaaaa-churros', r.body))
          .then(r => cloud.withOptions({ qs: descQuery }).get(contentsApi))
          .then(r => validateContents('zzzzz-churros', r.body));
      });
    });
