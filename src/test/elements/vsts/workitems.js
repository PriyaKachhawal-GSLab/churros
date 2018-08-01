const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const payload = tools.requirePayload(`${__dirname}/assets/workitems-create.json`);
const updatePayload = tools.requirePayload(`${__dirname}/assets/workitems-update.json`);
const expect = require('chakram').expect;

suite.forElement('collaboration', 'work-items', { payload: payload }, (test) => {
  const update = {
    churros: {
      updatePayload
    }
  };

  test.withOptions(update).should.supportCruds();
  test.should.supportPagination();
  test.should.supportCeqlSearch('System.Title');

  it('should allow orderBy for work-items', () => {
    let ids = [], query = { orderBy: 'System.Id desc' };
    return cloud.withOptions({qs: query}).get(test.api)
      .then(r => ids = r.body.map(o => o.id))
      .then(r => cloud.get(test.api))
      .then(r => {
        expect(r.body).to.not.be.empty;
        let descIds = r.body.map(o => o.id).sort().reverse();
        expect(ids).to.equal(ids);
      });
  });

  it('should allow fields for work-items', () => {
    return cloud.withOptions({qs: {fields : 'System.Id'}}).get(test.api)
      .then(r => expect(r.body).to.not.be.empty && expect(r.body.filter(o => {
        let keys = Object.keys(o);
        return keys.length == 1 && keys[0] == 'id';
      })).to.not.be.empty);
  }); 

  it('should allow SR for /work-items/{workItemId}/revisions', () => {
    let workItemId, revisionId;
    return cloud.post(test.api, payload)
      .then(r => workItemId = r.body.id)
      .then(r => cloud.get(`${test.api}/${workItemId}/revisions`))
      .then(r => {
        expect(r.body).to.not.be.empty;
        revisionId = r.body[0].rev;
      })
      .then(r => cloud.get(`${test.api}/${workItemId}/revisions/${revisionId}`))
      .then(r => cloud.delete(`${test.api}/${workItemId}`));
  });

  it('should support pagination for /work-items/{workItemId}/revisions', () => {
    const genUpdate = () => updatePayload;
    let workItemId, page1, page2;
    return cloud.post(test.api, payload)
      .then(r => workItemId = r.body.id)
      .then(r => cloud.patch(`${test.api}/${workItemId}`, genUpdate())) //Generating 3 updates for total of 4
      .then(r => cloud.patch(`${test.api}/${workItemId}`, genUpdate())) // VSTS doesn't allow ASYNC :[
      .then(r => cloud.patch(`${test.api}/${workItemId}`, genUpdate()))
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 2}}).get(`${test.api}/${workItemId}/revisions`))
      .then(r => {
        expect(r.body).to.have.lengthOf(2);
        page1 = r.body;
      })
      .then(r => cloud.withOptions({ qs: { page: 2, pageSize: 2}}).get(`${test.api}/${workItemId}/revisions`))
      .then(r => {
        expect(r.body).to.have.lengthOf(2);
        page2 = r.body;
      })
      .then(r => cloud.withOptions({ qs: { page: 1, pageSize: 4}}).get(`${test.api}/${workItemId}/revisions`))
      .then(r => {
        expect(r.body).to.have.lengthOf(4);
        expect(r.body).to.deep.equal(page1.concat(page2));
      })
      .then(r => cloud.delete(`${test.api}/${workItemId}`))
      .catch(e => cloud.delete(`${test.api}/${workItemId}`));
  });
});