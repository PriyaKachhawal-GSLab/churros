'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const expect = require('chakram').expect;

let listPayload = tools.requirePayload(`${__dirname}/assets/sitesLists.json`);
let sitePayload = tools.requirePayload(`${__dirname}/assets/sites.json`);
let listItemsPayload = tools.requirePayload(`${__dirname}/assets/listItems.json`);

suite.forElement('documents', 'sites/lists', { payload: listPayload }, (test) => {
  test.should.supportCrud();
  test.should.supportPagination();
  test
    .withOptions({ qs: { where: 'Modified > \'2018-04-12T06:47:33Z\'' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.Modified = '2018-04-12T06:47:33Z');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();
});

it('should support CUDS for sites', () => {
  let categoryId = -1;
  return cloud.post(`${test.api}`, sitePayload)
    .then(r => cloud.get(`${test.api}`))
    .then(r => cloud.patch(`${test.api}`, sitePayload))
    .then(r => cloud.delete(`${test.api}`));
});

suite.forElement('documents', 'sites/lists/{id}/items', { payload: listItemsPayload }, (test) => {
  test.should.supportCruds();
});
