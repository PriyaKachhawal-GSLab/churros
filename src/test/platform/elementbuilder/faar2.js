'use strict';

const expect = require('chakram').expect;
const suite = require('core/suite');
const cloud = require('core/cloud');
const provisioner = require('core/provisioner');
const newResource = require('./assets/faar2/resource.json');
const R = require('ramda');
let formula = require('./assets/faar2/formula.json');

suite.forPlatform('faar2', {}, (test) => {
  let faarFormula, faarResource, newInstance, formulaInstance;

  before(() => cloud.get('formulas')
    .then(r => {
      faarFormula = R.pipe(R.prop('body'), R.find(R.propEq('name', 'GET /formula')))(r);
      if (!faarFormula) {
        return cloud.post('formulas', formula).then(f => faarFormula = f.body);
      } else {
        newResource.formulaId = faarFormula.id;
      }
    })
    .then(r => {
      return provisioner.create('sfdc');
    })
    .then(r => newInstance = r.body));

  it('should allow for creating resource of type formulaAsResource', () => {
    return cloud.post('elements/sfdc/resources', newResource)
    .then(r => {
      expect(r.body).to.not.be.empty;
      expect(r.body.id).to.not.be.empty;
      faarResource = r.body;
    });
  });

  it('should have formulaId saved on resource and be type formulaAsResource', () => {
    return cloud.get(`elements/sfdc/resources/${faarResource.id}`)
    .then(r => {
      expect(r.body).to.not.be.empty;
      expect(r.body.formulaId).to.not.be.empty;
      expect(r.body.type === 'formulaAsResource').to.be.true;
    });
  });

  it('resource should show in api documentation', () => {
    return cloud.get(`instances/${newInstance.id}/docs`)
    .then(r => {
      expect(r.body.paths['/formula']).to.not.be.empty;
    });
  });
  
  it('should support calling the formula as an element resource', () => {
    return cloud.get('hubs/crm/formula', (r) => expect(r).to.have.statusCode(200));
  });

  it('should have auto created a formula instances', () => {
    return cloud.get(`formulas/${faarFormula.id}/instances`)
      .then(r => {
        expect(r.body).to.not.be.empty;
        expect(r.body[0]).to.not.be.empty;
        expect(r.body[0].name.indexOf(newInstance.name) !== -1).to.be.true;
        formulaInstance = r.body[0];
      });
  });

  after(() => {
      return cloud.delete(`formulas/${faarFormula.id}/instances/${formulaInstance.id}`)
    .then(r => {
      return provisioner.delete(newInstance.id, 'elements/sfdc/instances');
    })
    .then(r => {
      return cloud.delete(`elements/sfdc/resources/${faarResource.id}`);  
    })
    .then(r => {
      cloud.delete(`formulas/${faarFormula.id}`);
    }).catch(err => {
      console.log("something failed " + err);
    });
  });
});