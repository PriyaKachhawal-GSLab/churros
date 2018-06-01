'use strict';

const suite = require('core/suite');
const expect = require('chakram').expect;

suite.forElement('social', 'interactions', (test) => {
  test.withOptions({ qs: { where: 'socialNetworkType=\'Twitter\' and socialNetworkId=82295100 and targetSocialNetworkId=876713392311902208' } })
    .withName('should support search by filter')
    .withValidation(r => {
      expect(r).to.statusCode(200);
      const validValues = r.body.filter(obj => obj.socialNetworkType = 'Twitter');
      expect(validValues.length).to.equal(r.body.length);
    })
    .should.return200OnGet();

    test.withOptions({ qs: { where: 'socialNetworkType=\'Twitter\' and socialNetworkId=82295100 and targetSocialNetworkId=876713392311902208' } })
    .should.supportNextPagePagination(2);
});
