'use strict';

const suite = require('core/suite');
const props = require('core/props');
const chakram = require('chakram');
const expect = chakram.expect;

suite.forPlatform('general', {}, (test) => {
  describe('endpoint calls', () => {
    it('should include x-frame-options header to a JSP endpoint', () =>
      chakram.get('/elements/jsp/login.jsp', { baseUrl: props.get('url') })
        .then(r => expect(r).to.have.header('x-frame-options')));

    it('should not include x-frame-options header to a non-JSP endpoint', () =>
      chakram.get('/elements/api-docs', { baseUrl: props.get('url') })
        .then(r => expect(r).to.not.have.header('x-frame-options')));
  });

  describe('cors headers', () => {
    it('should return the proper Access-Control-Expose-Headers header', () =>
      chakram.get('/elements/api-v2/elements', { baseUrl: props.get('url'), headers: { 'Origin': 'churros' } })
        .then(r => {
          return expect(r).to.have.header(
          'Access-Control-Expose-Headers',
          'Elements-Returned-Count, Elements-Total-Count, Elements-Request-Id, Elements-Next-Page-Token, Elements-Trace-Id, Elements-Error, Content-Disposition'
          );
        })
      );
  });
});
