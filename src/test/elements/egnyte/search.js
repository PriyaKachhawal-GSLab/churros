'use strict';

const chakram = require('chakram');
const expect = chakram.expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const basePath = '/Shared/churros';

suite.forElement('documents', 'search', (test) => {
  const path = `${__dirname}/assets/Penguins.jpg`;
  const query = { path: `${basePath}/Penguins-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };
  const searchQuery = { text: 'Penguins' };


  const fileWrap = (cb) => {
    let file;

    return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
      .then(r => file = r.body)
      .then(r => cb(file))
      .then(r => cloud.delete(`/hubs/documents/files/${file.id}`));
  };

  test.should.supportNextPagePagination(1);

  it(`should allow GET for ${test.api}`, () => {
    const cb = (file) => {
      return cloud.withOptions({ qs: searchQuery }).get(`${test.api}`);
    };

    return fileWrap(cb);
  });

  it(`should allow paginating with page and pageSize for GET ${test.api}`, () => {
    const getWithOptions = (api, option, result) => {
      return cloud.withOptions(option).get(api)
        .then((r) => {
          if (r.body && r.body.length > 0) {
            result.body = r.body;
            expect(result.body.length).to.be.below(option.qs.pageSize + 1);
            return r.response.headers['elements-next-page-token'];
          }
        });
    };

    const cb = (file) => {
      const options = { qs: searchQuery };
      const pageSize = options ? options.qs ? options.qs.pageSize ? options.qs.pageSize : 2 : 2 : 2;
      const page = options ? options.qs ? options.qs.page ? options.qs.page : 1 : 1 : 1;
      const options1 = Object.assign({}, options);
      options1.qs = Object.assign({}, options1.qs, { page: page, pageSize: pageSize });
      const options2 = Object.assign({}, options);
      options2.qs = Object.assign({}, options2.qs, { page: page + 1, pageSize: pageSize });
      const options3 = Object.assign({}, options);
      options3.qs = Object.assign({}, options3.qs, { page: page, pageSize: (pageSize * 2) });
      let result1 = { body: [] },
        result2 = { body: [] },
        result3 = { body: [] };

      return getWithOptions(test.api, options1, result1)
        .then(nextPage => getWithOptions(test.api, nextPage ? { qs: Object.assign({}, options2.qs, { pageSize: pageSize, nextPage: nextPage, page: page + 1 }) } : options2, result2))
        .then(nextPage => getWithOptions(test.api, nextPage ? { qs: Object.assign({}, options3.qs, { pageSize: pageSize * 2 }) } : options3, result3));
    };

    return fileWrap(cb);
  });
});
