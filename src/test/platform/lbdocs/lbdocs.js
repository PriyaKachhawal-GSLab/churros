'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const allElementKeys = ["netsuitecrmv2", "zohocrm", "ciscospark", "hubspotcrm", "pardot", "hubspot", "netsuiteerpv2", "netsuitehcv2", "sugarcrmv2", "jira", "bigcommerce", "stripe", "twiliov2", "zuorav2", "netsuitefinancev2", "quickbooks", "paypalv2", "concur", "servicecloud", "infusionsoftmarketing", "acton", "sfdcdocuments", "sfdclibraries", "adobe-esign", "docusign", "facebooksocial", "facebookleadads", "shopify", "sharepoint", "salescloud", "salesforcemarketingcloud", "zendesk", "desk", "freshbooks", "freshdeskv2", "servicemax", "intacct", "sfdcservicecloud", "quickbooksonprem", "sapc4ccrm"];

suite.forPlatform('lbdocs', {}, () => {
  let elements;

  before(() => cloud.get('/elements')
    .then(r => {
      elements = r.body.reduce((p, c) => {
        if (c.active && allElementKeys.includes(c.key)) {
          p.push({ id: c.id, key: c.key });
        }
        return p;
      }, []);
    }));

  // Just checking 200 here - will enhance later...
  it('should return proper lbdocs json', () => {
    let failures = [];
    return Promise.all(elements.map(element => {
      return cloud.withOptions({ qs: { force: true } }).get(`/elements/${element.id}/lbdocs`)
        .catch((err) => failures.push({ id: element.id, error: err, key: element.key }));
    })).then(() => expect(failures).to.deep.equal([]));
  });
});
