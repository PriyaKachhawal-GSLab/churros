const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const attachmentUpdatePayload = tools.requirePayload(`${__dirname}/assets/updateAttachment.json`);
const categoriesPost = tools.requirePayload(`${__dirname}/assets/categories.json`);

var categoryId;
suite.forElement('humancapital', 'categories', (test) => {
    before(() => {
        return cloud.get(`${test.api}/attachments`)
            .then(r => categoryId = r.body[0].id);
    });
   
    let jpgFile = __dirname + '/assets/joker.jpg';
    it(`should allow C for ${test.api}`, () => {
        return cloud.post(test.api, categoriesPost);
    });
    it(`should allow Crus for ${test.api}/${categoryId}/attachments`, () => {
        let attachmentId;
        let query = { fileName: tools.random(), share: 'yes' };
        return cloud.withOptions({ qs: query }).postFile(`${test.api}/${categoryId}/attachments`, jpgFile)
            .then(r => attachmentId = r.body.id)
            .then(r => cloud.get(`${test.api}/${categoryId}/attachments/${attachmentId}`))
            .then(r => cloud.patch(`${test.api}/${categoryId}/attachments/${attachmentId}`, attachmentUpdatePayload))
            .then(r => cloud.get(`${test.api}/attachments`));
    });
});