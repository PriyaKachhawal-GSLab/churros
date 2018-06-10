'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/invoices.json`);
const invoiceComment = tools.requirePayload(`${__dirname}/assets/Comment.json`);

suite.forElement('ecommerce', 'invoices', { payload: payload }, (test) => {
      let entity_id, updatedAt;
      test.should.supportCrs();
      test.should.supportPagination();
      it(`should allow CR for /hubs/ecommerce/invoices-comments`, () => {
        return cloud.post(test.api, payload)
          .then(r => {
                invoiceComment.entity.entity_id = r.body.id;
                entity_id = r.body.id;
                updatedAt = r.body.updated_at;
              })
              .then(r => cloud.post(`/hubs/ecommerce/invoices-comments`, invoiceComment))
              .then(r => cloud.get(`/hubs/ecommerce/invoices/${entity_id}/comments`));
          });
        test
          .withName(`should support searching ${test.api} by updated_at`)
          .withOptions({ qs: { where: `updated_at = '${updatedAt}'` } })
          .withValidation((r) => {
            expect(r).to.have.statusCode(200);
            const validValues = r.body.filter(obj => obj.updated_at = updatedAt);
            expect(validValues.length).to.equal(r.body.length);
          }).should.return200OnGet();

        it(`should allow C for /hubs/ecommerce/invoices/{entity_id}/emails`, () => {
          return cloud.post(`/hubs/ecommerce/invoices/${entity_id}/emails`);
        });
        //Skipped since this requires an invoice to be set to Authorize only payment method, which can be done through UI
        it.skip(`should allow C for /hubs/ecommerce/invoices/{entity_id}/capture`, () => {
          return cloud.post(`/hubs/ecommerce/invoices/${entity_id}/capture`);
        });
        //Skipped since this requires an invoice to be set to Authorize only payment method, which can be done through UI
        it.skip(`should allow D for /hubs/ecommerce/invoices/{entity_id}`, () => {
          return cloud.delete(`/hubs/ecommerce/invoices/${entity_id}`);
        });
      });
