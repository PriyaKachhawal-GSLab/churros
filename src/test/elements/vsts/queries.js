const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const queryUpdatePayload = require('./assets/queries-update.json');
const payload = require('./assets/queries-create.json');

suite.forElement('collaboration', 'queries', { payload }, (test) => {
  /* const updatePayload = {
     churros: {
       updatePayload: queryUpdatePayload
     }
   };
   test.withOptions(updatePayload).should.supportCruds(); */
  it('should support CRUDS, S with options for queries', () => {
    let queryId, queryName;
    return cloud.get(test.api)
      .then(r => cloud.withOptions({ qs: { depth: '2' } }).get(test.api))
      .then(r => cloud.post(test.api, payload))
      .then(r => {
        expect(r.body).to.not.be.empty;
        queryId = r.body.id;
        queryName = r.body.name;
      })
      .then(r => cloud.get(`${test.api}/${queryId}`))
      .then(r => {
        expect(r.body.id).to.equal(queryId);
        expect(r.body.name).to.equal(queryName);
      })
      .then(r => cloud.patch(`${test.api}/${queryId}`, queryUpdatePayload))
      .then(r => {
        expect(r.body.name).to.not.equal(queryName);
      })
      .then(r => cloud.delete(`${test.api}/${queryId}`));  
  });
  test.should.supportPagination();
});