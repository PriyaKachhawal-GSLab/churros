'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const provisioner = require('core/provisioner');
const props = require('core/props');
const tools = require('core/tools');

let workflow = require('./assets/hubspotcrm.workflow.json');
let workflowFaar = require('./assets/hubspotcrm.workflow.faar.json');
let invalidWorkflowFaar = require('./assets/hubspotcrm.invalid.workflow.faar.json');

suite.forPlatform('bulk', (test) => {
  let instanceId;
  const element = props.getForKey('bulk', 'element');
  before(done => provisioner.create(element)
    .then(r => {
      instanceId = r.body.id;
      workflow[ 0 ].targetConfiguration.token = r.body.token;
      workflowFaar[ 0 ].targetConfiguration.token = r.body.token;
    })
    .then(r => done()));

  after(done => provisioner.delete(instanceId)
    .then(r => done()));

  it('should support bulk download', () => {
    let bulkId;
    // start bulk query
    return cloud.withOptions({ qs: { q: 'select * from accounts' } }).post('/hubs/crm/bulk/query')
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // wait for download to finish by checking status
      .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/crm/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
      })))
      // get bulk query errors
      .then(r => cloud.get(`/hubs/crm/bulk/${bulkId}/errors`))
      // get bulk query results in JSON
      .then(r => cloud.withOptions({ headers: { accept: "application/json" }, qs: {json: '{ "convertToNativeType": "false" }' }}).get(`/hubs/crm/bulk/${bulkId}/accounts`, r => {
        expect(r.body).to.not.be.empty;
        expect(r.response.headers['content-type']).to.contain('application/json');
      }))
      // get bulk query results in CSV
      .then(r => cloud.withOptions({ headers: { accept: "text/csv" } }).get(`/hubs/crm/bulk/${bulkId}/accounts`, r => {
        expect(r.body).to.not.be.empty;
        expect(r.response.headers['content-type']).to.equal('text/csv');
      }));
  });

  it('should support bulk upload', () => {
    let bulkId;
    // start bulk upload
    return cloud.postFile('/hubs/crm/bulk/accounts', __dirname + `/assets/${element}.accounts.csv`)
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk upload status
      .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/crm/bulk/${bulkId}/status`, r => {
        expect(r.body.status).to.equal('COMPLETED');
      })))
      // get bulk upload errors
      .then(r => cloud.get(`/hubs/crm/bulk/${bulkId}/errors`));
  });

  it('should support bulk workflow', () => {
    let bulkId;
    // start bulk workflow
    return cloud.post('/hubs/crm/bulk/workflows', workflow)
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk upload status
      .then(r => tools.wait.upTo(120000).for(() => cloud.withOptions({ qs: { pageSize: 1 } }).get('/bulkloader', r => {
        expect(r.body[ 0 ].groupName).to.equal(bulkId);
        expect(r.body[ 0 ].status).to.equal('COMPLETED');
      })));
  });

  it('should support bulk workflow with FaaR', () => {
    let bulkId;
    let bulkFormula = require('./assets/hubspotcrm.formula.faar.json');
    // start bulk workflow
    return cloud.post('/formulas', bulkFormula)
      .then(r => bulkFormula.id = r.body.id)
      .then(() => cloud.post('/hubs/crm/bulk/workflows', workflowFaar))
      .then(r => {
        expect(r.body.status).to.equal('CREATED');
        bulkId = r.body.id;
      })
      // get bulk upload status
      .then(r => tools.wait.upTo(120000).for(() => cloud.withOptions({ qs: { pageSize: 1 } }).get('/bulkloader', r => {
        expect(r.body[ 0 ].groupName).to.equal(bulkId);
        expect(r.body[ 0 ].status).to.equal('COMPLETED');
      })))
      .then(r => cloud.withOptions({ qs: { parentBulkLoaderId: r.body[0].bulkLoaderId } }).get('/bulkloader'))
      .then(r => expect(r.body.length).to.equal(4))
      .then(() => cloud.delete(`/formulas/${bulkFormula.id}`))
      .catch(e => {
        if (bulkFormula.id) cloud.delete(`/formulas/${bulkFormula.id}`);
        throw new Error(e);
      });
  });

  it('should fail bulk workflow with invalid FaaR specification', () => {
    let bulkId;
    let bulkFormula = require('./assets/hubspotcrm.formula.faar.json');
    // start bulk workflow
    return cloud.post('/formulas', bulkFormula)
      .then(r => bulkFormula.id = r.body.id)
      .then(() => cloud.post('/hubs/crm/bulk/workflows', invalidWorkflowFaar, r => {
        expect(r).to.have.statusCode(400);
        expect(r.body.message).to.equal("The 'postprocess' and 'postprocessFaarUri' options are incompatible");
      }))
      .then(() => cloud.delete(`/formulas/${bulkFormula.id}`))
      .catch(e => {
        if (bulkFormula.id) cloud.delete(`/formulas/${bulkFormula.id}`);
        throw new Error(e);
      });
  });

  it('should support scheduled bulk workflow', () => {
    let jobId;
    // start bulk workflow
    return cloud.withOptions({ headers: { "Elements-Schedule-Request": "0 * * * * ?" } }).post('/hubs/crm/bulk/workflows', workflow)
      .then(r => {
        expect(r.body.id).to.not.be.empty;
        jobId = r.body.id;
      })
      // get bulk upload status
      .then(r => tools.wait.upTo(200000).for(() => cloud.withOptions({ qs: { jobId: jobId } }).get('/bulkloader', r => {
        expect(r.body[ 0 ].status).to.equal('COMPLETED');
      })));
  });

  it('should support paged error retrieval', () => {
      let bulkId;
      // start bulk upload
      const options = { qs: { pageSize: 30 } };
      return cloud.postFile('/hubs/crm/bulk/bad', __dirname + `/assets/${element}.bad.csv`)
          .then(r => {
              expect(r.body.status).to.equal('CREATED');
              bulkId = r.body.id;
          })
          // get bulk upload status
          .then(r => tools.wait.upTo(30000).for(() => cloud.get(`/hubs/crm/bulk/${bulkId}/status`, r => {
              expect(r.body.status).to.equal('COMPLETED');
          })))
          // get bulk upload errors
          .then(r => cloud.withOptions(options).get(`/hubs/crm/bulk/${bulkId}/errors`))
          .then(r => {
              expect(r.response.headers['elements-returned-count']).to.equal('30');
              expect(r.body.length).to.equal(30);
              options.qs.nextPage = r.response.headers['elements-next-page-token'];
          })
          .then(r => cloud.withOptions(options).get(`/hubs/crm/bulk/${bulkId}/errors`))
          .then(r => {
              expect(r).to.not.have.header('elements-next-page-token');
              expect(r.response.headers['elements-returned-count']).to.equal('7');
              expect(r.body.length).to.equal(7);
          });
  });
  it('should support cancellation of jobs', () => {
    let instanceId, jobId;
    // sfdc does this
    return provisioner.create('pipedrive')
      .then(r => {
        instanceId = r.body.id;
      })
      .then(r => cloud.withOptions({ qs: { q: 'select * from accounts' } }).post('/hubs/crm/bulk/query'))
      .then(r => {
                  expect(r.body.status).to.equal('CREATED');
                  jobId = r.body.id;
                })
      .then(r => cloud.put('hubs/crm/bulk/' + jobId + '/cancel'))

      .then(r => expect(r.response.statusCode).to.equal(200))
      .then(r => tools.wait.upTo(3000).for(() => cloud.get(`/hubs/crm/bulk/${jobId}/status`, r => {
        expect(r.body.status).to.equal('CANCELLED');
      })))
      .then(r => provisioner.delete(instanceId));

  });

});
