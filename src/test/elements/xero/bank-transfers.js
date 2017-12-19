'use strict';

const cloud = require('core/cloud');
const suite = require('core/suite');
const expect = require('chakram').expect;

let payload = require('./assets/bank-transfer.json');

suite.forElement('finance', 'bank-transfers', (test) => {
    afterEach(done => {
        // to avoid rate limit errors
        setTimeout(done, 5000);
    });
    
    test.should.supportPagination();
    
    before(() => {
        /* 
        Accounts w/ transactions can't be deleted so we rely 
         on 2 accounts to be present - 'FromBank-DoNotDelete' & 'ToBank-DoNotDelete'
        */
        return cloud.get('/ledger-accounts')
        .then(r => {
            let objsWithBank = r.body.filter(obj => obj.Type === 'BANK');
            expect(objsWithBank.length).to.be.at.least(2);
            let fromAccount = objsWithBank.filter(obj => obj.Name === 'FromBank-DoNotDelete');
            expect(fromAccount).to.not.be.empty;
            payload.ToBankAccount.AccountID = fromAccount[0].AccountID;
            let toAccount = objsWithBank.filter(obj => obj.Name === 'ToBank-DoNotDelete');
            expect(toAccount).to.not.be.empty;
            payload.FromBankAccount.AccountID = toAccount[0].AccountID;
        });
    });

    it('should support CRS for /bank-transfers', () => {
        let id;

        return cloud.post(test.api, payload)
        .then(r => id = r.body.BankTransferID)
        .then(() => cloud.get(`${test.api}/${id}`))
        .then(r => expect(r.body).to.not.be.empty)
        .then(() => cloud.get(test.api))
        .then(r => expect(r.body).to.not.be.empty)
        .then(() => cloud.withOptions({qs: {where: `BankTransferID='${id}'`}}).get(test.api))
        .then(r => expect(r.body.length).to.equal(1) && expect(r.body[0].BankTransferID).to.equal(id));
    });
});
