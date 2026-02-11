/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Registro de Auditoria (Log)
 * ============================================================
 * Grava ações na aba Log com timestamp, usuário, ação e detalhes.
 * logAction() NUNCA lança exceção — falhas são silenciosas.
 * ============================================================
 */

/**
 * Registra uma ação na aba Log.
 *
 * @param {string} action  - Identificador da ação (ex: 'CRIAR_PROCESSO', 'ERROR')
 * @param {string} details - Texto livre com detalhes
 */
function logAction(action, details) {
  try {
    var user;
    try {
      user = Session.getActiveUser().getEmail();
    } catch (e) {
      user = 'Sistema';
    }
    if (!user) user = 'Sistema';

    var timestamp = new Date();
    var row = [
      formatDateTimeBR(timestamp),
      user,
      String(action),
      String(details || '')
    ];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET.LOG);
    if (sheet) {
      sheet.appendRow(row);
    }
  } catch (e) {
    // Log NUNCA lança exceção. Falha silenciosa com log no Stackdriver.
    console.error('logAction falhou: ' + e.message);
  }
}

/**
 * Consulta entradas do log com filtros opcionais.
 * Operação de leitura — sem lock.
 *
 * @param {Object} [filters] - Filtros opcionais
 * @param {string} [filters.acao]      - Filtrar por ação
 * @param {string} [filters.usuario]   - Filtrar por usuário
 * @param {Date}   [filters.dataInicio] - Data início
 * @param {Date}   [filters.dataFim]    - Data fim
 * @param {number} [filters.limite]     - Máximo de registros (default 100)
 * @returns {{success: boolean, data: Array<Object>, message: string}}
 */
function consultarLog(filters) {
  try {
    filters = filters || {};
    var limite = filters.limite || 100;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET.LOG);
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, data: [], message: 'Nenhum registro encontrado.' };
    }

    var allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
    var results = [];

    for (var i = allData.length - 1; i >= 0 && results.length < limite; i--) {
      var row = allData[i];
      var dataHora = row[0];
      var usuario = String(row[1]);
      var acao = String(row[2]);
      var detalhes = String(row[3]);

      // Aplicar filtros
      if (filters.acao && acao !== filters.acao) continue;
      if (filters.usuario && usuario.indexOf(filters.usuario) === -1) continue;

      if (filters.dataInicio || filters.dataFim) {
        var logDate;
        if (dataHora instanceof Date) {
          logDate = dataHora;
        } else {
          // Parse dd/MM/yyyy HH:mm:ss
          var parts = String(dataHora).split(' ');
          var dateParts = parts[0].split('/');
          logDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        }

        if (filters.dataInicio && logDate < filters.dataInicio) continue;
        if (filters.dataFim && logDate > filters.dataFim) continue;
      }

      results.push({
        dataHora: dataHora,
        usuario: usuario,
        acao: acao,
        detalhes: detalhes
      });
    }

    return {
      success: true,
      data: results,
      message: results.length + ' registro(s) encontrado(s).'
    };
  } catch (e) {
    return { success: false, data: [], message: 'Erro ao consultar log: ' + e.message };
  }
}
