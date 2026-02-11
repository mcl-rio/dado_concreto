/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Camada de Acesso a Dados (DAL)
 * ============================================================
 * Abstrai todas as interações com SpreadsheetApp.
 * NENHUM outro arquivo deve chamar getRange(), getValues()
 * ou setValues() diretamente.
 *
 * Princípios:
 * - Batch reads: getDataRange().getValues()
 * - Batch writes: setValues() em uma operação
 * - Cache de referência por invocação (GAS é stateless)
 * ============================================================
 */

// ── Cache por invocação (resetado a cada server call) ───────
var _ss = null;
var _sheets = {};

/**
 * Retorna referência ao spreadsheet ativo (com cache).
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getSpreadsheet_() {
  if (!_ss) {
    _ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  return _ss;
}

/**
 * Retorna a sheet por nome (com cache).
 * @param {string} sheetName
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 * @throws {Error} se a aba não existir
 */
function getSheet_(sheetName) {
  if (!_sheets[sheetName]) {
    var sheet = getSpreadsheet_().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Aba nao encontrada: ' + sheetName);
    }
    _sheets[sheetName] = sheet;
  }
  return _sheets[sheetName];
}

// ── Namespace DAL ───────────────────────────────────────────
var DAL = {

  /**
   * Lê todas as linhas de dados de uma aba (exclui header/linha 1).
   * @param {string} sheetName
   * @returns {Array<Array<any>>} Array 2D de valores
   */
  readAll: function(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return [];
    return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  },

  /**
   * Lê a linha de cabeçalho (linha 1).
   * @param {string} sheetName
   * @returns {Array<string>}
   */
  readHeaders: function(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return [];
    return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  },

  /**
   * Lê linhas que satisfazem uma função predicado.
   * @param {string} sheetName
   * @param {Function} predicateFn - function(row) retornando boolean
   * @returns {Array<{rowIndex: number, data: Array<any>}>}
   *          rowIndex é 1-based (header=1, primeiro dado=2)
   */
  readWhere: function(sheetName, predicateFn) {
    var allRows = DAL.readAll(sheetName);
    var results = [];
    for (var i = 0; i < allRows.length; i++) {
      if (predicateFn(allRows[i])) {
        results.push({
          rowIndex: i + 2,  // +2 porque: array 0-based + header na linha 1
          data: allRows[i]
        });
      }
    }
    return results;
  },

  /**
   * Encontra uma única linha por valor em uma coluna específica.
   * @param {string} sheetName
   * @param {number} colIndex - índice 1-based da coluna
   * @param {any} value - valor a buscar
   * @returns {{rowIndex: number, data: Array<any>}|null}
   */
  findRow: function(sheetName, colIndex, value) {
    var allRows = DAL.readAll(sheetName);
    for (var i = 0; i < allRows.length; i++) {
      if (String(allRows[i][colIndex - 1]) === String(value)) {
        return {
          rowIndex: i + 2,
          data: allRows[i]
        };
      }
    }
    return null;
  },

  /**
   * Adiciona uma linha ao final da aba.
   * @param {string} sheetName
   * @param {Array<any>} rowData
   */
  appendRow: function(sheetName, rowData) {
    var sheet = getSheet_(sheetName);
    sheet.appendRow(rowData);
  },

  /**
   * Adiciona múltiplas linhas ao final da aba em uma operação.
   * @param {string} sheetName
   * @param {Array<Array<any>>} rows
   */
  appendRows: function(sheetName, rows) {
    if (!rows || rows.length === 0) return;
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    var numCols = rows[0].length;
    sheet.getRange(lastRow + 1, 1, rows.length, numCols).setValues(rows);
  },

  /**
   * Atualiza uma linha inteira (sobrescreve da coluna 1).
   * @param {string} sheetName
   * @param {number} rowIndex - índice 1-based da linha na sheet
   * @param {Array<any>} rowData
   */
  updateRow: function(sheetName, rowIndex, rowData) {
    var sheet = getSheet_(sheetName);
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  },

  /**
   * Atualiza uma célula específica.
   * @param {string} sheetName
   * @param {number} rowIndex - 1-based
   * @param {number} colIndex - 1-based
   * @param {any} value
   */
  updateCell: function(sheetName, rowIndex, colIndex, value) {
    var sheet = getSheet_(sheetName);
    sheet.getRange(rowIndex, colIndex).setValue(value);
  },

  /**
   * Escreve um bloco 2D de dados a partir de uma posição.
   * Usado para tabelas do Dashboard.
   * @param {string} sheetName
   * @param {number} startRow - 1-based
   * @param {number} startCol - 1-based
   * @param {Array<Array<any>>} data
   */
  writeBlock: function(sheetName, startRow, startCol, data) {
    if (!data || data.length === 0) return;
    var sheet = getSheet_(sheetName);
    var numRows = data.length;
    var numCols = data[0].length;
    sheet.getRange(startRow, startCol, numRows, numCols).setValues(data);
  },

  /**
   * Retorna o número de linhas de dados (total - header).
   * @param {string} sheetName
   * @returns {number}
   */
  countRows: function(sheetName) {
    var sheet = getSheet_(sheetName);
    return Math.max(0, sheet.getLastRow() - 1);
  },

  /**
   * Limpa todas as linhas de dados (mantém o header).
   * @param {string} sheetName
   */
  clearData: function(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
  }
};
