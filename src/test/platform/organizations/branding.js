'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const chakram = require('chakram');
const expect = chakram.expect;
const R = require('ramda');

suite.forPlatform('organizations/branding', test => {
  const cleanup = () => {
    return cloud.delete('/organizations/branding', () => true);
  };

  before(cleanup);

  const branding = {
    headerFont: 'Helvetica',
    headerColor: '#586f75',
    bodyFont: 'Helvetica',
    bodyColor: '#aedce7',
    themePrimaryColor: '#586f75',
    themeSecondaryColor: '#aedce7',
    themeHighlightColor: '#468499',
    buttonPrimaryBackgroundColor: '#c64',
    buttonPrimaryTextColor: '#aedce7',
    buttonSecondaryBackgroundColor: '#aedce7',
    buttonSecondaryTextColor: '#cc6649',
    buttonDeleteBackgroundColor: '#eee',
    buttonDeleteTextColor: '#FFF',
    logoBackgroundColor: '#ffffff',
    topBarBackgroundColor: '#aedce7',
    navigationBackgroundColor: '#aedce7',
    contextBackgroundColor: '#aedce7',
    cardHeaderColor: '#ffffff',
    cardBackground: '#ffffff',
    cardMenuBackground: '#ffffff',
    cardMenuLinkColor: '#ffffff',
    navigationLinkBackground: '#ffffff',
    navigationLinkForeground: '#ffffff',
    navigationLinkBackgroundHover: '#ffffff',
    navigationLinkForegroundHover: '#ffffff',
    navigationLinkBackgroundActive: '#ffffff',
    navigationLinkForegroundActive: '#ffffff',
    topBarNavigationColor: '#ffffff',
    tableHeaderBackground: '#ffffff',
    tableHeaderForeground: '#ffffff',
    tableBodyBackground: '#ffffff',
    tableBodyForeground: '#ffffff',
    navigationIconSize: '12px',
    navigationLabelSize: '12px',
    navigationWidth: '12px',
    componentsBorderColor: '#ffffff',
    topBarTitleColor: '#ffffff',
    navigationItemBorderColor: '#ffffff',
    documentationUrl: 'http://joshuawyse.com'
  };

  it('should support upserting, retrieving and deleting branding for a company', () => {
    return cloud.put('/organizations/branding', branding)
      .then(r => {
        expect(r.body.bodyFont).to.equal('Helvetica');
        branding.bodyFont = 'Arial';
      })
      .then(() => cloud.put('/organizations/branding', branding))
      .then(r => {
        expect(r.body.bodyFont).to.equal('Arial');
      })
      .then(() => cloud.get(`/organizations/branding`))
      .then(r => {
        expect(r.body.bodyFont).to.equal('Arial');
      })
      .then(() => cloud.delete(`/organizations/branding`));
  });

  it('should fail when upserting branding for a company with missing fields', () => {
    const b = { headerFont: 'Helvetica' };

    const validator = r => {
      expect(r).to.have.statusCode(400);
      expect(r.body.message).to.contain('Branding missing required field(s)');
    };

    return cloud.put('/organizations/branding', b, validator);
  });

  it('should fail when upserting branding for a company with invalid color fields', () => {
    const b = R.assoc('headerColor', 'blah', branding);

    const validator = r => {
      expect(r).to.have.statusCode(400);
      expect(r.body.message).to.contain('Branding contains invalid field(s)');
    };

    return cloud.put('/organizations/branding', b, validator);
  });

  it('should support saving a logo and favicon for branding for a company', () => {
    return cloud.put('/organizations/branding', branding)
      .then(() => cloud.patchFile('/organizations/branding/logo', __dirname + `/assets/logo.png`))
      .then(() => cloud.patchFile('/organizations/branding/favicon', __dirname + `/assets/favicon.png`))
      .then(() => cloud.get(`/organizations/branding`))
      .then(r => {
        expect(r.body.favicon).to.contain('https://images.cloudelements.io/favicon');
        expect(r.body.logo).to.contain('https://images.cloudelements.io/logo');
      })
      .then(() => cloud.delete(`/organizations/branding`));
  });

});
