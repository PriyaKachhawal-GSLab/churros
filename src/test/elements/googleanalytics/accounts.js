'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const expect = chakram.expect;
const cloud = require('core/cloud');

const payload = tools.requirePayload(`${__dirname}/assets/filters_payload.json`);
const userLinksPayload = tools.requirePayload(`${__dirname}/assets/user_links_payload.json`);
const webpropertiesPayload = tools.requirePayload(`${__dirname}/assets/webproperties_payload.json`);
const adwordsLinkPayload = tools.requirePayload(`${__dirname}/assets/adwords_payload.json`);
const customdimensionsPayload = tools.requirePayload(`${__dirname}/assets/customdimensions_payload.json`);
const entityUserLinksPayload = tools.requirePayload(`${__dirname}/assets/entityUserLinks_payload.json`);
const profilesPayload = tools.requirePayload(`${__dirname}/assets/profiles_payload.json`);
const profileentityUserLinksPayload = tools.requirePayload(`${__dirname}/assets/profilesEntityUserLinks_payload.json`);
const experimentsPayload = tools.requirePayload(`${__dirname}/assets/experiments_Payload.json`);
const goalsPayload = tools.requirePayload(`${__dirname}/assets/goals_Payload.json`);
const remarketingPayload = tools.requirePayload(`${__dirname}/assets/remarketing_payload.json`);
const profileFilterPayload = tools.requirePayload(`${__dirname}/assets/profileFilters_payload.json`);

suite.forElement('general', 'accounts', {
    payload: payload
}, (test) => {
    let accountId = -1;
    let webPropertiesId = -1;
    let profileId = -1;
    
    it('should allow GET /accounts', () => {
        return cloud.get(test.api)
            .then(r => {
                expect(r.body.length).to.not.be.empty;
            });

    });
    it('should allow GET /accounts/account-summaries', () => {
        return cloud.get(`${test.api}/account-summaries`)
			.then(r => {
				expect(r.body.length).to.not.be.empty;
			});
    });
    it('should allow CRUDS for /accounts/{id}/filters', () => {
        return cloud.get(test.api)
            .then(r => accountId = r.body[0].id)
            .then(r => cloud.cruds(`${test.api}/${accountId}/filters`, payload, chakram.put));
    });
    it('should allow CRUDS for /accounts/{id}/user-links', () => {
        let userLinksId = -1;
        return cloud.post(`${test.api}/${accountId}/user-links`, userLinksPayload)
            .then(r => userLinksId = r.body.id)
            .then(r => cloud.put(`${test.api}/${accountId}/user-links/${userLinksId}`, userLinksPayload))
            .then(r => cloud.get(`${test.api}/${accountId}/user-links`))
            .then(r => expect(r.body.length).to.not.be.empty)
            .then(r => cloud.delete(`${test.api}/${accountId}/user-links/${userLinksId}`));
    });
    it('should allow CRUS for /accounts/{id}/web-properties', () => {
        return cloud.get(test.api)
            .then(r => accountId = r.body[0].id)
            .then(r => cloud.crus(`${test.api}/${accountId}/web-properties`, webpropertiesPayload, chakram.put));
    });
    it('should allow CRUDS for /accounts/{id}/web-properties/${webPropertiesId}/adwords-links', () => {
        return cloud.get(`${test.api}/${accountId}/web-properties`)
            .then(r => webPropertiesId = r.body[0].id)
            .then(r => cloud.cruds(`${test.api}/${accountId}/web-properties/${webPropertiesId}/adwords-links`, adwordsLinkPayload, chakram.put));
    });
    it('should allow GET /accounts/{id}/web-properties/{webPropertiesId}/custom-data-sources', () => {
        return cloud.get(`${test.api}/${accountId}/web-properties/${webPropertiesId}/custom-data-sources`)
        .then(r => {
				expect(r.body.length).to.not.be.empty;
			});
    });

    it('should allow RDS for /accounts/{id}/web-properties/${webPropertiesId}/custom-data-sources/{customDataSourcesId}/uploads', () => {

		let uploadId = -1;
        return cloud.get(`${test.api}/${accountId}/web-properties/${webPropertiesId}/custom-data-sources/cKVHMm9NS8SmROqRTCyexw/uploads`)
            .then(r => uploadId = r.body[0].id)
            .then(r => cloud.get(`${test.api}/${accountId}/web-properties/${webPropertiesId}/custom-data-sources/cKVHMm9NS8SmROqRTCyexw/uploads/${uploadId}`))
            .then(r => cloud.delete(`${test.api}/${accountId}/web-properties/${webPropertiesId}/custom-data-sources/cKVHMm9NS8SmROqRTCyexw/uploads/${uploadId}`));
    });

    it('should allow CRUS for /accounts/{id}/web-properties/${webPropertiesId}/custom-dimensions', () => {
        return cloud.crus(`${test.api}/${accountId}/web-properties/${webPropertiesId}/custom-dimensions`, customdimensionsPayload, chakram.put);
    });
    it('should allow CRUDS for /accounts/{id}/web-properties/${webPropertiesId}/user-links', () => {
        let entityUserLinksId = -1;
        return cloud.post(`${test.api}/${accountId}/web-properties/${webPropertiesId}/entity-user-links`, entityUserLinksPayload)
            .then(r => entityUserLinksId = r.body.id)
            .then(r => cloud.put(`${test.api}/${accountId}/web-properties/${webPropertiesId}/entity-user-links/${entityUserLinksId}`, entityUserLinksPayload))
            .then(r => cloud.get(`${test.api}/${accountId}/web-properties/${webPropertiesId}/entity-user-links`))
            .then(r => expect(r.body.length).to.not.be.empty)
            .then(r => cloud.delete(`${test.api}/${accountId}/web-properties/${webPropertiesId}/entity-user-links/${entityUserLinksId}`));
    });
    it('should allow CRUDS for /accounts/{id}/web-properties/${webPropertiesId}/profiles', () => {
        return cloud.cruds(`${test.api}/${accountId}/web-properties/${webPropertiesId}/profiles`, profilesPayload, chakram.put);
    });
    it('should allow CRUDS for /accounts/{id}/web-properties/${webPropertiesId}/profiles/${profileId}/entity-user-links', () => {
        let profileEntityUserLinksId = -1;
        return cloud.get(`${test.api}/${accountId}/web-properties/${webPropertiesId}/profiles`)
            .then(r => profileId = r.body[0].id)
            .then(r => cloud.post(`${test.api}/${accountId}/web-properties/${webPropertiesId}/profiles/${profileId}/entity-user-links`, profileentityUserLinksPayload))
            .then(r => profileEntityUserLinksId = r.body.id)
            .then(r => cloud.put(`${test.api}/${accountId}/web-properties/${webPropertiesId}/profiles/${profileId}/entity-user-links/${profileEntityUserLinksId}`, profileentityUserLinksPayload))
            .then(r => cloud.get(`${test.api}/${accountId}/web-properties/${webPropertiesId}/profiles/${profileId}/entity-user-links`))
            .then(r => expect(r.body.length).to.not.be.empty)
            .then(r => cloud.delete(`${test.api}/${accountId}/web-properties/${webPropertiesId}/profiles/${profileId}/entity-user-links/${profileEntityUserLinksId}`));
    });
    it('should allow CRUS for /accounts/{id}/web-properties/${webPropertiesId}/profiles/${profileId}/experiments', () => {
        return cloud.cruds(`${test.api}/${accountId}/web-properties/${webPropertiesId}/profiles/${profileId}/experiments`, experimentsPayload, chakram.put);
    });
    it('should allow CRUS for /accounts/{id}/web-properties/${webPropertiesId}/profiles/${profileId}/goals', () => {
        return cloud.crus(`${test.api}/${accountId}/web-properties/${webPropertiesId}/profiles/${profileId}/goals`, goalsPayload, chakram.put);
    });
    it('should allow CRUDS for /accounts/{id}/web-properties/${webPropertiesId}/profiles/${profileId}/profile-filter-links', () => {
        return cloud.cruds(`${test.api}/${accountId}/web-properties/${webPropertiesId}/profiles/${profileId}/profile-filter-links`, profileFilterPayload, chakram.put);
    });
    it('should allow CRUDS for /accounts/{id}/web-properties/${webPropertiesId}/profiles/${profileId}/remarketing-audiences', () => {
        return cloud.cruds(`${test.api}/${accountId}/web-properties/${webPropertiesId}/remarketing-audiences`, remarketingPayload, chakram.put);
    });
});