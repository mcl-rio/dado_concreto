/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Gestao de Etapas
 * ============================================================
 */

function criarEtapasParaAquisicao_(aquisicaoId) {
  var hoje = new Date();
  var rows = [];
  for (var i = 0; i < STAGES.length; i++) {
    var stage = STAGES[i];
    rows.push([
      aquisicaoId, stage.num, stage.name, stage.responsible,
      STATUS.PENDENTE, '', '', '', '', ''
    ]);
  }
  rows[0][COL_ETAPA.STATUS - 1] = STATUS.EM_ANDAMENTO;
  rows[0][COL_ETAPA.DATA_INICIO - 1] = hoje;
  DAL.appendRows(SHEET.ETAPAS, rows);
}

function consultarEtapas(aquisicaoId) {
  try {
    var rows = DAL.readWhere(SHEET.ETAPAS, function(row) {
      return String(row[COL_ETAPA.ID_AQUISICAO - 1]) === aquisicaoId;
    });
    var etapas = rows.map(function(r) {
      return {
        idAquisicao: r.data[COL_ETAPA.ID_AQUISICAO - 1],
        num: r.data[COL_ETAPA.NUM - 1],
        etapa: r.data[COL_ETAPA.ETAPA - 1],
        responsavel: r.data[COL_ETAPA.RESPONSAVEL - 1],
        status: r.data[COL_ETAPA.STATUS - 1],
        dataInicio: r.data[COL_ETAPA.DATA_INICIO - 1],
        dataConclusao: r.data[COL_ETAPA.DATA_CONCLUSAO - 1],
        prazoLimite: r.data[COL_ETAPA.PRAZO_LIMITE - 1],
        documentoRef: r.data[COL_ETAPA.DOCUMENTO_REF - 1],
        observacoes: r.data[COL_ETAPA.OBSERVACOES - 1],
        rowIndex: r.rowIndex
      };
    });
    etapas.sort(function(a, b) { return a.num - b.num; });
    return { success: true, data: etapas, message: etapas.length + ' etapa(s) encontrada(s).' };
  } catch (e) { return { success: false, data: [], message: 'Erro: ' + e.message }; }
}

function concluirEtapa(aquisicaoId, etapaNum) {
  return withDocumentLock(function() {
    var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
      return String(row[COL_ETAPA.ID_AQUISICAO - 1]) === aquisicaoId;
    });
    if (stageRows.length === 0) return { success: false, message: 'Etapas nao encontradas para ' + aquisicaoId, nextStage: null };
    stageRows.sort(function(a, b) { return a.data[COL_ETAPA.NUM - 1] - b.data[COL_ETAPA.NUM - 1]; });

    var current = null;
    for (var i = 0; i < stageRows.length; i++) {
      if (stageRows[i].data[COL_ETAPA.NUM - 1] === etapaNum) { current = stageRows[i]; break; }
    }
    if (!current) return { success: false, message: 'Etapa ' + etapaNum + ' nao encontrada.', nextStage: null };
    if (current.data[COL_ETAPA.STATUS - 1] === STATUS.CONCLUIDO) return { success: false, message: 'Etapa ja concluida.', nextStage: null };

    current.data[COL_ETAPA.STATUS - 1] = STATUS.CONCLUIDO;
    current.data[COL_ETAPA.DATA_CONCLUSAO - 1] = new Date();
    DAL.updateRow(SHEET.ETAPAS, current.rowIndex, current.data);

    var nextStage = null;
    for (var j = 0; j < stageRows.length; j++) {
      var s = stageRows[j];
      if (s.data[COL_ETAPA.NUM - 1] > etapaNum && s.data[COL_ETAPA.STATUS - 1] === STATUS.PENDENTE) {
        nextStage = s; break;
      }
    }

    if (nextStage) {
      nextStage.data[COL_ETAPA.STATUS - 1] = STATUS.EM_ANDAMENTO;
      nextStage.data[COL_ETAPA.DATA_INICIO - 1] = new Date();
      DAL.updateRow(SHEET.ETAPAS, nextStage.rowIndex, nextStage.data);
      var nextLabel = nextStage.data[COL_ETAPA.NUM - 1] + '. ' + nextStage.data[COL_ETAPA.ETAPA - 1];
      atualizarEtapaAtualAquisicao_(aquisicaoId, nextLabel);
      logAction('CONCLUIR_ETAPA', aquisicaoId + ' - etapa ' + etapaNum + ' concluida. Proxima: ' + nextStage.data[COL_ETAPA.NUM - 1]);
      return { success: true, message: 'Etapa ' + etapaNum + ' concluida. Proxima: ' + nextStage.data[COL_ETAPA.NUM - 1] + '. ' + nextStage.data[COL_ETAPA.ETAPA - 1], nextStage: nextStage.data[COL_ETAPA.NUM - 1] };
    } else {
      var allDone = stageRows.every(function(s) {
        var st = s.data[COL_ETAPA.STATUS - 1];
        return st === STATUS.CONCLUIDO || st === STATUS.NAO_APLICAVEL;
      });
      if (allDone) {
        atualizarStatusAquisicao_(aquisicaoId, STATUS.CONCLUIDO);
        logAction('CONCLUIR_AQUISICAO', aquisicaoId + ' - todas as etapas concluidas');
        return { success: true, message: 'Todas as etapas concluidas. Aquisicao ' + aquisicaoId + ' finalizada.', nextStage: null };
      }
      logAction('CONCLUIR_ETAPA', aquisicaoId + ' - etapa ' + etapaNum + ' concluida');
      return { success: true, message: 'Etapa ' + etapaNum + ' concluida.', nextStage: null };
    }
  }, 'concluirEtapa');
}

function atualizarEtapa(aquisicaoId, etapaNum, updates) {
  return withDocumentLock(function() {
    var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
      return String(row[COL_ETAPA.ID_AQUISICAO - 1]) === aquisicaoId && row[COL_ETAPA.NUM - 1] === etapaNum;
    });
    if (stageRows.length === 0) return { success: false, message: 'Etapa nao encontrada.' };
    var stage = stageRows[0];
    if (updates.prazoLimite !== undefined) stage.data[COL_ETAPA.PRAZO_LIMITE - 1] = updates.prazoLimite;
    if (updates.documentoRef !== undefined) stage.data[COL_ETAPA.DOCUMENTO_REF - 1] = normalizeString(updates.documentoRef);
    if (updates.observacoes !== undefined) stage.data[COL_ETAPA.OBSERVACOES - 1] = normalizeString(updates.observacoes);
    DAL.updateRow(SHEET.ETAPAS, stage.rowIndex, stage.data);
    logAction('ATUALIZAR_ETAPA', aquisicaoId + ' - etapa ' + etapaNum + ' atualizada');
    return { success: true, message: 'Etapa ' + etapaNum + ' atualizada.' };
  }, 'atualizarEtapa');
}

function getEtapaAtual(aquisicaoId) {
  var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
    return String(row[COL_ETAPA.ID_AQUISICAO - 1]) === aquisicaoId && row[COL_ETAPA.STATUS - 1] === STATUS.EM_ANDAMENTO;
  });
  if (stageRows.length === 0) return null;
  var s = stageRows[0].data;
  return { num: s[COL_ETAPA.NUM - 1], name: s[COL_ETAPA.ETAPA - 1], responsible: s[COL_ETAPA.RESPONSAVEL - 1] };
}

function calcularDiasAberto(dataAbertura) {
  if (!dataAbertura || !(dataAbertura instanceof Date)) return 0;
  return Math.max(0, diffDays(new Date(), dataAbertura));
}

function getLastTransitionDate_(aquisicaoId, allEtapas) {
  var etapas = allEtapas || DAL.readAll(SHEET.ETAPAS);
  var lastDate = null;
  for (var i = 0; i < etapas.length; i++) {
    var rowData = Array.isArray(etapas[i]) ? etapas[i] : etapas[i].data;
    if (String(rowData[COL_ETAPA.ID_AQUISICAO - 1]) !== aquisicaoId) continue;
    var dataConclusao = rowData[COL_ETAPA.DATA_CONCLUSAO - 1];
    if (dataConclusao instanceof Date && !isNaN(dataConclusao.getTime())) {
      if (!lastDate || dataConclusao > lastDate) lastDate = dataConclusao;
    }
  }
  return lastDate;
}

function atualizarEtapaAtualAquisicao_(aquisicaoId, etapaLabel) {
  var aq = DAL.findRow(SHEET.AQUISICOES, COL_AQUIS.ID, aquisicaoId);
  if (aq) {
    aq.data[COL_AQUIS.ETAPA_ATUAL - 1] = etapaLabel;
    DAL.updateRow(SHEET.AQUISICOES, aq.rowIndex, aq.data);
  }
}

function atualizarStatusAquisicao_(aquisicaoId, novoStatus) {
  var aq = DAL.findRow(SHEET.AQUISICOES, COL_AQUIS.ID, aquisicaoId);
  if (aq) {
    aq.data[COL_AQUIS.STATUS_GERAL - 1] = novoStatus;
    DAL.updateRow(SHEET.AQUISICOES, aq.rowIndex, aq.data);
  }
}
