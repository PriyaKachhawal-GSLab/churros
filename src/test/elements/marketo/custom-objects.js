'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/custom-objects.json`);

suite.forElement('marketing', 'custom-objects', { payload: payload }, (test) => {
	let customObjectName, id;
  it('should allow R for /custom-objects, /custom-fields-templates and CRUD for /custom-objects{customObjectName}/custom-fields', () => {
    return cloud.get(test.api)
	.then(r => customObjectName = 'afrinCustom_c')
	.then(r => cloud.get(`${test.api}/${customObjectName}/custom-fields-templates`))
	.then(r => cloud.post(`${test.api}/${customObjectName}/custom-fields`, payload))
	.then(r => id = r.body[0].marketoGUID)
	.then(r => cloud.patch(`${test.api}/${customObjectName}/custom-fields/${id}`, payload))
	.then(r => cloud.delete(`${test.api}/${customObjectName}/custom-fields/${id}`));
  });
  
  it('should allow S and cursor pagination for /custom-objects{customObjectName}/custom-fields', () => {
    const options = { qs: { pageSize: 2 ,  where: `marketoGUID='c244523c-0a21-4c56-aa71-a845af615d4c,dab80af7-849f-47da-97af-cb3160867892, a3305990-a7e6-46f4-9a5b-9f81ae5db16c'`} };
    return cloud.withOptions(options).get(`${test.api}/${customObjectName}/custom-fields`)
      .then(r => {
        expect(r.body).to.not.be.null;
        options.qs.nextPage = r.response.headers['elements-next-page-token'];
        return cloud.withOptions(options).get(`${test.api}/${customObjectName}/custom-fields`);
      });
  });
});
