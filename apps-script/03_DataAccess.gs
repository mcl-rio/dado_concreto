/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Camada de Acesso a Dados (DAL)
 * ============================================================
 */

var _ss = null;
var _sheets = {};

function getSpreadsheet_() {
  if (!_ss) _ss = SpreadsheetApp.getActiveSpreadsheet();
  return _ss;
}

function getSheet_(sheetName) {
  if (!_sheets[sheetName]) {
    var sheet = getSpreadsheet_().getSheetByName(sheetName);
    if (!sheet) throw new Error('Aba nao encontrada: ' + sheetName);
    _sheets[sheetName] = sheet;
  }
  return _sheets[sheetName];
}

var DAL = {
  readAll: function(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return [];
    return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  },

  readHeaders: function(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return [];
    return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  },

  readWhere: function(sheetName, predicateFn) {
    var allRows = DAL.readAll(sheetName);
    var results = [];
    for (var i = 0; i < allRows.length; i++) {
      if (predicateFn(allRows[i])) {
        results.push({ rowIndex: i + 2, data: allRows[i] });
      }
    }
    return results;
  },

  findRow: function(sheetName, colIndex, value) {
    var allRows = DAL.readAll(sheetName);
    for (var i = 0; i < allRows.length; i++) {
      if (String(allRows[i][colIndex - 1]) === String(value)) {
        return { rowIndex: i + 2, data: allRows[i] };
      }
    }
    return null;
  },

  appendRow: function(sheetName, rowData) {
    getSheet_(sheetName).appendRow(rowData);
  },

  appendRows: function(sheetName, rows) {
    if (!rows || rows.length === 0) return;
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
  },

  updateRow: function(sheetName, rowIndex, rowData) {
    getSheet_(sheetName).getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  },

  updateCell: function(sheetName, rowIndex, colIndex, value) {
    getSheet_(sheetName).getRange(rowIndex, colIndex).setValue(value);
  },

  writeBlock: function(sheetName, startRow, startCol, data) {
    if (!data || data.length === 0) return;
    getSheet_(sheetName).getRange(startRow, startCol, data.length, data[0].length).setValues(data);
  },

  countRows: function(sheetName) {
    return Math.max(0, getSheet_(sheetName).getLastRow() - 1);
  },

  clearData: function(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
  },

  deleteRow: function(sheetName, rowIndex) {
    getSheet_(sheetName).deleteRow(rowIndex);
  }
};
