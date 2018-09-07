'use strict';

const suite = require('core/suite');

const groupQuery = () => ({
  script: "select top 5 count(*), email from contacts group by email order by 1 desc"
});

suite.forElement('db', 'query', {}, (test) => {
  test.withJson(groupQuery()).should.return200OnPost();
});
