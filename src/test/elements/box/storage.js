'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');

suite.forElement('documents', 'storage', null, (test) => {
  afterEach(done => {
    //We were getting a 429 before this
    setTimeout(done, 2500);
  });

  test.should.return200OnGet();
});