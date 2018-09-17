'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const tools = require('core/tools');
const query = tools.requirePayload(`${__dirname}/assets/files-requiredQueryParam-crud.json`);
const queryParamPayload = tools.requirePayload(`${__dirname}/assets/filesLinks-requiredQueryParam-sd.json`);

suite.forElement('documents', 'links', null, (test) => {

    let path = __dirname + '/assets/brady.jpg';

    const fileWrap = (cb) => {
        let file;

        return cloud.withOptions({ qs: query }).postFile('/hubs/documents/files', path)
            .then(r => file = r.body)
            .then(r => cb(file))
            .then(r => cloud.delete(`/hubs/documents/files/${file.id}`));

    };

    it('should create a link with no expiration and public visibility from GET /files/links by default while having correct download and view URLs', () => {
        const cb = (file) => {
          queryParamPayload.path = file.path;
            return cloud.withOptions({ qs: queryParamPayload }).get('/hubs/documents/files/links?raw=true')
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
          queryParamPayload.expires = '2020-02-20';
            return cloud.withOptions({ qs: queryParamPayload }).get('/hubs/documents/files/links')
                .then(r => {
                    // only compare the first 19 characters as the various testing environments may return different system times (UTC & non-UTC)
                    expect(r.body.providerLinkExpires.substring(0,19)).to.equal('2020-02-20T00:00:00');
                });
        };

        return fileWrap(cb);
    });

    it('should return the existing link from GET /files/links on subsequent calls for a path, regardless of supplied parameters', () => {
        const cb = (file) => {
          queryParamPayload.visibility = 'TEAM_ONLY';
            return cloud.withOptions({ qs: queryParamPayload }).get('/hubs/documents/files/links?raw=true')
                .then(r => {
                    expect(r.body.raw.linkPermissions.requestedVisibility).to.equal('TEAM_ONLY');
                    queryParamPayload.visibility = 'PASSWORD';
                })
                .then(r => cloud.withOptions({ qs: queryParamPayload }).get('/hubs/documents/files/links?raw=true'))
                .then(r => {
                    expect(r.body.raw.linkPermissions.requestedVisibility).to.equal('TEAM_ONLY');
                });
        };

        return fileWrap(cb);
    });

    it('should fail when no password is provided with a visibility of PASSWORD', () => {
        const cb = (file) => {
          queryParamPayload.visibility = 'PASSWORD';
            return cloud.withOptions({ qs: queryParamPayload }).get('/hubs/documents/files/links', r => {
                expect(r).to.have.statusCode(400);
                expect(r.body.message).to.equal('You must supply a password');
            });
        };

        return fileWrap(cb);
    });

    it('should fail when an invalid visibility is given', () => {
        const cb = (file) => {
          queryParamPayload.visibility = 'FOR_MILES_AND_MILES';
            return cloud.withOptions({ qs: queryParamPayload }).get('/hubs/documents/files/links', r => {
                expect(r).to.have.statusCode(400);
                expect(r.body.message).to.equal('An invalid value was used for a parameter');
                expect(r.body.providerMessage).to.equal('No enum constant com.dropbox.core.v2.sharing.RequestedVisibility.FOR_MILES_AND_MILES');
            });
        };

        return fileWrap(cb);
    });

    it('should fail when an invalid expiration date is given', () => {
        const cb = (file) => {
          queryParamPayload.expires = 'Monday';
            return cloud.withOptions({ qs: queryParamPayload }).get('/hubs/documents/files/links', r => {
                expect(r).to.have.statusCode(400);
                expect(r.body.message).to.equal('Invalid link expiration date.');
            });
        };

        return fileWrap(cb);
    });
});
