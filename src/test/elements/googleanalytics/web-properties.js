'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const chakram = require('chakram');
const cloud = require('core/cloud');
const expect = chakram.expect;

const payload = tools.requirePayload(`${__dirname}/assets/webproperties_payload.json`);
const adwordsLinkPayload = tools.requirePayload(`${__dirname}/assets/adwords_payload.json`);
const customdimensionsPayload = tools.requirePayload(`${__dirname}/assets/customdimensions_payload.json`);
const customMetricsPayload = tools.requirePayload(`${__dirname}/assets/customMetricsPayload.json`);
const profilesPayload = tools.requirePayload(`${__dirname}/assets/profiles_payload.json`);
const profileentityUserLinksPayload = tools.requirePayload(`${__dirname}/assets/profilesEntityUserLinks_payload.json`);
const experimentsPayload = tools.requirePayload(`${__dirname}/assets/experiments_Payload.json`);
const goalsPayload = tools.requirePayload(`${__dirname}/assets/goals_Payload.json`);
const remarketingPayload = tools.requirePayload(`${__dirname}/assets/remarketing_payload.json`);
const profileFilterPayload = tools.requirePayload(`${__dirname}/assets/profileFilters_payload.json`);

// Skipping the test as there is no delete API supported and we might reach the allowable limit.
suite.forElement('general', 'web-properties', {payload: payload, skip: true}, (test) => {
	test.should.supportCrus(chakram.put);
    test.should.supportCrus();
    test.should.supportPagination();
});

suite.forElement('general', 'web-properties', (test) => {
    let webPropertiesId = -1;
    let profileId = -1;

    it('should allow CRUDS for /web-properties/${webPropertiesId}/adwords-links', () => {
        return cloud.get(`${test.api}`)
            .then(r => webPropertiesId = r.body[0].id)
            .then(r => cloud.cruds(`${test.api}/${webPropertiesId}/adwords-links`, adwordsLinkPayload, chakram.put));
    });
    
    it('should allow GET /web-properties/{webPropertiesId}/custom-data-sources', () => {
        return cloud.get(`${test.api}/${webPropertiesId}/custom-data-sources`)
        .then(r => {
                expect(r.body.length).to.not.be.empty;
            });
    });
    
    // Skip the test as POST API is not working with churros and delete API is supported so it will delete all over time
    it.skip('should allow RDS for /web-properties/${webPropertiesId}/custom-data-sources/{customDataSourcesId}/uploads', () => {
        let uploadId = -1;
        return cloud.get(`${test.api}/${webPropertiesId}/custom-data-sources/cKVHMm9NS8SmROqRTCyexw/uploads`)
            .then(r => uploadId = r.body[0].id)
            .then(r => cloud.get(`${test.api}/${webPropertiesId}/custom-data-sources/cKVHMm9NS8SmROqRTCyexw/uploads/${uploadId}`))
            .then(r => cloud.delete(`${test.api}/${webPropertiesId}/custom-data-sources/cKVHMm9NS8SmROqRTCyexw/uploads/${uploadId}`));
    });

    // Skip the test as delete API is not available
    it.skip('should allow CRUS for /web-properties/${webPropertiesId}/custom-dimensions', () => {
        return cloud.crus(`${test.api}/${webPropertiesId}/custom-dimensions`, customdimensionsPayload, chakram.put);
    });

    // Skip the test as delete API is not available
    it.skip('should allow CRUS for /web-properties/${webPropertiesId}/custom-metrics', () => {
        return cloud.crus(`${test.api}/${webPropertiesId}/custom-metrics`, customMetricsPayload, chakram.put);
    });

    it('should allow CRUDS for /web-properties/${webPropertiesId}/profiles', () => {
        return cloud.cruds(`${test.api}/${webPropertiesId}/profiles`, profilesPayload, chakram.put);
    });

    it('should allow CRUDS for /web-properties/${webPropertiesId}/profiles/${profileId}/entity-user-links', () => {
        let profileEntityUserLinksId = -1;
        return cloud.get(`${test.api}/${webPropertiesId}/profiles`)
            .then(r => profileId = r.body[0].id)
            .then(r => cloud.post(`${test.api}/${webPropertiesId}/profiles/${profileId}/entity-user-links`, profileentityUserLinksPayload))
            .then(r => profileEntityUserLinksId = r.body.id)
            .then(r => cloud.put(`${test.api}/${webPropertiesId}/profiles/${profileId}/entity-user-links/${profileEntityUserLinksId}`, profileentityUserLinksPayload))
            .then(r => cloud.get(`${test.api}/${webPropertiesId}/profiles/${profileId}/entity-user-links`))
            .then(r => expect(r.body.length).to.not.be.empty)
            .then(r => cloud.delete(`${test.api}/${webPropertiesId}/profiles/${profileId}/entity-user-links/${profileEntityUserLinksId}`));
    });

    it('should allow CRUS for /web-properties/${webPropertiesId}/profiles/${profileId}/experiments', () => {
        return cloud.cruds(`${test.api}/${webPropertiesId}/profiles/${profileId}/experiments`, experimentsPayload, chakram.put);
    });

    it('should allow CRUS for /web-properties/${webPropertiesId}/profiles/${profileId}/goals', () => {
        return cloud.crus(`${test.api}/${webPropertiesId}/profiles/${profileId}/goals`, goalsPayload, chakram.put);
    });
    
    it('should allow CRUDS for /web-properties/${webPropertiesId}/profiles/${profileId}/profile-filter-links', () => {
        return cloud.cruds(`${test.api}/${webPropertiesId}/profiles/${profileId}/profile-filter-links`, profileFilterPayload, chakram.put);
    });
    
    // GET by Id operation is not allowed as the account does not have permission for it.
    it.skip('should allow CRUDS for /web-properties/${webPropertiesId}/profiles/${profileId}/remarketing-audiences', () => {
        return cloud.cruds(`${test.api}/${webPropertiesId}/remarketing-audiences`, remarketingPayload, chakram.put);
    });
});