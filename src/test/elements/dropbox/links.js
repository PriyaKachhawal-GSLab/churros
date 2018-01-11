'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

suite.forElement('documents', 'links', null, (test) => {

    let path = __dirname + '/assets/brady.jpg';
    let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg` };

    const fileWrap = (cb) => {
        let file;

        return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
            .then(r => file = r.body)
            .then(r => cb(file))
            .then(r => cloud.delete(`/hubs/documents/files/${file.id}`));

    };

    it('should create a link with no expiration and proper download & view URLs', () => {
        const cb = (file) => {
            return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/links')
                .then(r => {
                    expect(r.body.expires).to.be.null;
                    expect(r.body.providerViewLink).to.contain('dl=0');
                    expect(r.body.providerLink).to.contain('dl=1');
                });
        };

        return fileWrap(cb);
    });
});
