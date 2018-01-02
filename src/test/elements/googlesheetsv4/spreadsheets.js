'use strict';

const suite = require('core/suite');
const cloud = require('core/cloud');
const spreadSheetPayload = require('./assets/spreadsheets');
const spreadSheetUpdatePayload = require('./assets/spreadsheetsupdate');
const newspreadSheetPayload = require('./assets/newspreadsheets');
const destSpreadsheetPayload = require('./assets/destSpreadsheetId');
const workSheetPayload = require('./assets/worksheets');
const workSheetUpdatePayload = require('./assets/worksheetsupdate');
const multipleCellsPayload = require('./assets/multiplecells');
const multipleCellsUpdatePayload = require('./assets/multiplecellsupdate');
const rowPayload = require('./assets/row');
const rowUpdatePayload = require('./assets/rowupdate');

suite.forElement('general', 'spreadsheets', (test) => {
  let spreadsheetId, sheetId, destsheetId, worksheetName, range, rowId;
  test.should.supportPagination();

  it('should allow CU for /spreadsheets', () => {
    return cloud.get(test.api)
      .then(r => cloud.post(test.api, spreadSheetPayload))
      .then(r => spreadsheetId = r.body.spreadsheetId)
      .then(r => cloud.put(`${test.api}/${spreadsheetId}`, spreadSheetUpdatePayload));
  });

  it('should allow CRUD for /spreadsheets/{spreadsheetId}/worksheets', () => {
    return cloud.post(`${test.api}/${spreadsheetId}/worksheets`, workSheetPayload)
      .then(r => sheetId = r.body[0].sheetId)
      .then(r => cloud.put(`${test.api}/${spreadsheetId}/worksheets/${sheetId}`, workSheetUpdatePayload))
      .then(r => cloud.get(`${test.api}/${spreadsheetId}/worksheets/${sheetId}`))
      .then(r => worksheetName = r.body.title);
  });

  it('should allow CRUD for /spreadsheets/{spreadsheetId}/worksheets{worksheetName}/multiples', () => {
    return cloud.post(`${test.api}/${spreadsheetId}/worksheets/${worksheetName}/multiples`, multipleCellsPayload)
      .then(r => range = 'A1')
      .then(r => cloud.put(`${test.api}/${spreadsheetId}/worksheets/${worksheetName}/multiples/${range}`, multipleCellsUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${spreadsheetId}/worksheets/${worksheetName}/multiples/${range}`));
  });

  it('should allow CRUD for /spreadsheets/{spreadsheetId}/worksheets{worksheetName}/rows', () => {
    return cloud.post(`${test.api}/${spreadsheetId}/worksheets/${worksheetName}/rows`, rowPayload)
      .then(r => rowId = 'C3')
      .then(r => cloud.put(`${test.api}/${spreadsheetId}/worksheets/${worksheetName}/rows/${rowId}`, rowUpdatePayload))
      .then(r => cloud.delete(`${test.api}/${spreadsheetId}/worksheets/${worksheetName}/rows/${rowId}`));
  });

  it('should allow copy worksheet /spreadsheets/{spreadsheetId}/worksheets/{sheetId}:copyTo', () => {
    return cloud.post(test.api, newspreadSheetPayload)
      .then(r => destsheetId = r.body.spreadsheetId)
      .then(r => cloud.post(`${test.api}/${spreadsheetId}/worksheets/${sheetId}/copy`, destSpreadsheetPayload));
  });

  after(() => cloud.delete(`${test.api}/${spreadsheetId}/worksheets/${sheetId}`));
  after(() => cloud.delete(`${test.api}/${spreadsheetId}`));

});
