const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const attachmentUpdatePayload = tools.requirePayload(`${__dirname}/assets/updateAttachment.json`);
const categoriesPost = tools.requirePayload(`${__dirname}/assets/categories.json`);


suite.forElement('humancapital', 'categories', { payload: categoriesPost }, (test) => {
    let categoryId;
    before(() => {
        return cloud.get(test.api)
            .then(r => categoryId = r.body[0].id);
    });

    test.should.supportCs();

    it(`should allow Crus for ${test.api}/:categoryId/attachments`, () => {
        let attachmentId;
        let query = { fileName: tools.random(), share: 'yes' };
        let jpgFile = __dirname + '/assets/joker.jpg';
        return cloud.withOptions({ qs: query }).postFile(`${test.api}/${categoryId}/attachments`, jpgFile)
            .then(r => attachmentId = r.body.id)
            .then(r => cloud.get(`${test.api}/${categoryId}/attachments/${attachmentId}`))
            .then(r => cloud.patch(`${test.api}/${categoryId}/attachments/${attachmentId}`, attachmentUpdatePayload));
        //We have this API, but seems like we don't have permission to do this operation.
        //.then(r => cloud.delete(`${test.api}/${categoryId}/attachments/${attachmentId}`));
    });
});