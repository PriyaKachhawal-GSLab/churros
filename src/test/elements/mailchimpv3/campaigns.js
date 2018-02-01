'use strict';

const suite = require('core/suite');
const payload = require('core/tools').requirePayload(`${__dirname}/assets/campaigns.json`);
const cloud = require('core/cloud');
const expect = require('chakram').expect;

const updatePayload = () => ({
  "recipients": {
    "list_id": "7c11127640"
  },
  "type": "regular",
  "settings": {
    "subject_line": "Churros Update",
    "reply_to": "churros@cloud-elements.com",
    "from_name": "Senor Churro"
  }
});

const commentsPayload = () => ({
  "message": "Churros please"
});

const commentsUpdate = () => ({
  "message": "More churros please"
});

const options = {
  churros: {
    updatePayload: updatePayload()
  }
};

suite.forElement('marketing', 'campaigns', { payload: payload }, (test) => {
  test.should.supportPagination('id');
  test.withOptions(options).should.supportCruds();
  test.withOptions({ qs: { where: 'since_create_time=\'2016-01-23T17:55:00+00:00\'' } }).should.return200OnGet();

  it('should allow CRUDS for campaigns/{id}/comments', () => {
    let campaignId = -1;
    let commentId = -1;
    return cloud.post(test.api, payload)
      .then(r => campaignId = r.body.id)
      .then(r => cloud.post(`${test.api}/${campaignId}/comments`, commentsPayload()))
      .then(r => commentId = r.body.feedback_id)
      .then(r => cloud.get(`${test.api}/${campaignId}/comments/${commentId}`))
      .then(r => cloud.patch(`${test.api}/${campaignId}/comments/${commentId}`, commentsUpdate()))
      .then(r => cloud.post(`${test.api}/${campaignId}/comments`, commentsPayload()))
      .then(r => cloud.withOptions({qs: { page: 1, pageSize: 1 } }).get(`${test.api}/${campaignId}/comments`))
      .then(r => cloud.delete(`${test.api}/${campaignId}/comments/${commentId}`))
      .then(r => cloud.delete(`${test.api}/${campaignId}`));
  });
//This test assures that there is some campaign activity on the campaign we pull for
//GET campaigns/id/emailActivity
  it('should allow R for campaigns/{id}/email-activities', () => {
    let response, email_id, campaign_id;
    return cloud.get(`/hubs/marketing/campaigns`)
      .then((r) => {
        let data = r.body;
        expect(r.body).to.not.be.empty;
        response = data.filter((obj) => {
          return obj.report_summary;
        });
        campaign_id = response[0].id;
      })
      .then((r) => cloud.get(`/hubs/marketing/campaigns/${campaign_id}/email-activities`))
      .then((r) => {
        expect(r.body).to.not.be.empty;
        email_id = r.body[0].email_id;
      })
      .then((r) => cloud.get(`/hubs/marketing/campaigns/${campaign_id}/email-activities/${email_id}`));
  });
  
  //This test filters for campaigns that have emails that have been opened
  //PageSize is set to 400 because there were no opened emails available on the first page of campaigns
  it('should allow R for campaigns/{id}/open-details', () => {
    let response = [];
    let email_id, campaign_id;
    return cloud.withOptions({qs: { page: 1, pageSize: 400 } }).get(`${test.api}`)
      .then((r) => {
        let data = r.body;
        expect(r.body).to.not.be.empty;
        data.forEach((obj) => {
          if (obj.report_summary && obj.report_summary['opens']) {
            response.push(obj)
          }
        })
        campaign_id = response[0].id;
      })
      .then((r) => cloud.get(`/hubs/marketing/campaigns/${campaign_id}/open-details`))
      .then((r) => {
        expect(r.body).to.not.be.empty;
      })
  }); 
});
