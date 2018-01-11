'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');

suite.forElement('documents', 'links', null, (test) => {

    let path = __dirname + '/assets/brady.jpg';
    let query = { path: `/brady-${tools.randomStr('abcdefghijklmnopqrstuvwxyz1234567890', 10)}.jpg`, overwrite: true };

    const fileWrap = (cb) => {
        let file;

        return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
            .then(r => file = r.body)
            .then(r => cb(file))
            .then(r => cloud.delete(`/hubs/documents/files/${file.id}`));

    };

    it('should create a link with no expiration and public visibility from GET /files/links by default while having correct download and view URLs', () => {
        const cb = (file) => {
            return cloud.withOptions({ qs: { path: file.path } }).get('/hubs/documents/files/links?raw=true')
                .then(r => {
                    expect(r.body.expires).to.be.undefined;
                    expect(r.body.raw.linkPermissions.requestedVisibility).to.equal('PUBLIC');
                    expect(r.body.providerViewLink).to.contain('dl=0');
                    expect(r.body.providerLink).to.contain('dl=1');
                });
        };

        return fileWrap(cb);
    });

    it('should create a link with the specified expiration from GET /files/links', () => {
        const cb = (file) => {
            return cloud.withOptions({ qs: { path: file.path, expires: '2020-02-20' } }).get('/hubs/documents/files/links')
                .then(r => {
                    // only compare the first 19 characters as the various testing environments may return different system times (UTC & non-UTC)
                    expect(r.body.providerLinkExpires.substring(0,19)).to.equal('2020-02-20T00:00:00');
                });
        };

        return fileWrap(cb);
    });

    it('should return the existing link from GET /files/links on subsequent calls for a path, regardless of supplied parameters', () => {
        const cb = (file) => {
            return cloud.withOptions({ qs: { path: file.path, visibility: 'TEAM_ONLY'} }).get('/hubs/documents/files/links?raw=true')
                .then(r => {
                    expect(r.body.raw.linkPermissions.requestedVisibility).to.equal('TEAM_ONLY');
                })
                .then(r => cloud.withOptions({ qs: { path: file.path, visibility: 'PASSWORD' } }).get('/hubs/documents/files/links?raw=true'))
                .then(r => {
                    expect(r.body.raw.linkPermissions.requestedVisibility).to.equal('TEAM_ONLY');
                });
        };

        return fileWrap(cb);
    });

    it('should fail when no password is provided with a visibility of PASSWORD', () => {
        const cb = (file) => {
            return cloud.withOptions({ qs: { path: file.path, visibility: 'PASSWORD' } }).get('/hubs/documents/files/links', r => {
                expect(r).to.have.statusCode(400);
                expect(r.body.message).to.equal('You must supply a password');
            });
        };

        return fileWrap(cb);
    });

    it('should fail when an invalid visibility is given', () => {
        const cb = (file) => {
            return cloud.withOptions({ qs: { path: file.path, visibility: 'FOR_MILES_AND_MILES' } }).get('/hubs/documents/files/links', r => {
                expect(r).to.have.statusCode(400);
                expect(r.body.message).to.equal('An invalid value was used for a parameter');
                expect(r.body.providerMessage).to.equal('No enum constant com.dropbox.core.v2.sharing.RequestedVisibility.FOR_MILES_AND_MILES');
            });
        };

        return fileWrap(cb);
    });

    it('should fail when an invalid expiration date is given', () => {
        const cb = (file) => {
            return cloud.withOptions({ qs: { path: file.path, expires: 'Monday!' } }).get('/hubs/documents/files/links', r => {
                expect(r).to.have.statusCode(400);
                expect(r.body.message).to.equal('Invalid link expiration date.');
            });
        };

        return fileWrap(cb);
    });
});
