const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const attachmentUpdatePayload = tools.requirePayload(`${__dirname}/assets/updateAttachment.json`);
const categoriesPost = tools.requirePayload(`${__dirname}/assets/categories.json`);

suite.forElement('humancapital', 'categories', { payload: categoriesPost }, (test) => {
    let categoryId;
    before(() => {
        return cloud.get(`${test.api}/attachments`)
            .then(r => categoryId = r.body[0].id);
    });

    // it(`should allow C for ${test.api}`, () => {
    //     return cloud.post(test.api, categoriesPost);
    // });
    test.should.return200OnPost();
    it(`should allow Crus for ${test.api}/:categoryId/attachments`, () => {
        let jpgFile = `${__dirname}/assets/joker.jpg`;
        let attachmentId, query = { fileName: tools.random(), share: 'yes' };
        return cloud.withOptions({ qs: query }).postFile(`${test.api}/${categoryId}/attachments`, jpgFile)
            .then(r => attachmentId = r.body.id)
            .then(r => cloud.get(`${test.api}/${categoryId}/attachments/${attachmentId}`))
            .then(r => cloud.patch(`${test.api}/${categoryId}/attachments/${attachmentId}`, attachmentUpdatePayload))
            .then(r => cloud.get(`${test.api}/attachments`));
    });
});