'use strict';

const suite = require('core/suite');

suite.forElement('documents', 'storage', null, (test) => {
  after(done => {
    //We were getting a 429 before this
    setTimeout(done, 2500);
  });

  test.should.return200OnGet();
});