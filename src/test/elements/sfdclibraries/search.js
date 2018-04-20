'use strict';

const suite = require('core/suite');

suite.forElement('documents', 'search', (test) => {
  test.withOptions({ qs: { path: '/' } }).should.return200OnGet();
  test.withOptions({ qs: { path: '/churros', text: 'newerPath' } }).should.return200OnGet();
  test.withOptions({ qs: { path: '/churros', startDate: '2016-04-04T20:47:39Z' } }).should.return200OnGet();
  test.withOptions({ qs: { path: '/churros', startDate: '2016-04-04T20:47:39Z', endDate: '2016-04-04T21:42:16Z' } }).should.return200OnGet();
  test.should.supportNextPagePagination(1);
});
