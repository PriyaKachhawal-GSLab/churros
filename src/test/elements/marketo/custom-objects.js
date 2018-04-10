'use strict';

const suite = require('core/suite');
const tools = require('core/tools');
const cloud = require('core/cloud');
const expect = require('chakram').expect;
const payload = tools.requirePayload(`${__dirname}/assets/custom-objects.json`);

suite.forElement('marketing', 'custom-objects', { payload: payload }, (test) => {
	let customObjectName = 'afrinCustom_c', id;
	it('should allow R for /custom-objects', () => {
		const options = { qs: {   where: `names='leadActivities_c'`} };
		return cloud.withOptions(options).get(test.api);
	});
	it('should allow S for /custom-objects/{customObjectName}/custom-fields', () =>{
		const options = { qs: { where: `marketoGUID='c244523c-0a21-4c56-aa71-a845af615d4c,dab80af7-849f-47da-97af-cb3160867892, a3305990-a7e6-46f4-9a5b-9f81ae5db16c'`} };
		return cloud.withOptions(options).get(`${test.api}/${customObjectName}/custom-fields`);	
	});
	it('should allow paginating with page and nextPage /custom-objects/{customObjectName}/custom-fields', () => {
		const options = { qs: { pageSize: 1 ,  where: `marketoGUID='c244523c-0a21-4c56-aa71-a845af615d4c,dab80af7-849f-47da-97af-cb3160867892'`} };
		return cloud.withOptions(options).get(`${test.api}/${customObjectName}/custom-fields`)
		.then(r => {
			expect(r.body).to.not.be.null;
			id = r.body[0].marketoGUID;
			options.qs.nextPage = r.response.headers['elements-next-page-token'];
		})
		.then(r => cloud.withOptions(options).get(`${test.api}/${customObjectName}/custom-fields`))
		.then(r => expect(r.body[0].marketoGUID).to.not.be.equal(id));
	});
	it('should allow CRUD for /custom-objects/{customObjectName}/custom-fields', () =>{
		const updatePayload = () => ({
			"input" : [{
			"afrinchaks" : tools.random()
			}]
		});

		return cloud.post(`${test.api}/${customObjectName}/custom-fields`, payload)
		.then(r => id = r.body[0].marketoGUID)
		.then(r => cloud.get(`${test.api}/${customObjectName}/custom-fields/${id}`))
		.then(r => cloud.patch(`${test.api}/${customObjectName}/custom-fields/${id}`, updatePayload()))
		.then(r => cloud.delete(`${test.api}/${customObjectName}/custom-fields/${id}`));
	});
	it('should allow R for /custom-fields-templates', () =>{
		return cloud.get(`${test.api}/${customObjectName}/custom-fields-templates`);
	});
});
