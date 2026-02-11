/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Gestão de Etapas
 * ============================================================
 * Criação, consulta e avanço das 23 etapas do ciclo de
 * contratação. Avanço automático e cálculo de "Dias em Aberto".
 * ============================================================
 */

/**
 * Cria as 23 linhas de etapas para um novo processo.
 * DEVE ser chamada dentro de withDocumentLock().
 *
 * @param {string} processoId - ID do processo (ex: "DINT-2026-001")
 */
function criarEtapasParaProcesso_(processoId) {
  var hoje = new Date();
  var rows = [];

  for (var i = 0; i < STAGES.length; i++) {
    var stage = STAGES[i];
    rows.push([
      processoId,               // ID Processo
      stage.num,                // Nº Etapa
      stage.name,               // Etapa
      stage.responsible,        // Responsável
      STATUS.PENDENTE,          // Status (todas iniciam Pendente)
      '',                       // Data Início
      '',                       // Data Conclusão
      '',                       // Prazo Limite
      '',                       // Documento Ref.
      ''                        // Observações
    ]);
  }

  // Primeira etapa começa como "Em Andamento" com data de hoje
  rows[0][COL_ETAPA.STATUS - 1]      = STATUS.EM_ANDAMENTO;
  rows[0][COL_ETAPA.DATA_INICIO - 1] = hoje;

  DAL.appendRows(SHEET.ETAPAS, rows);
}

/**
 * Consulta todas as etapas de um processo.
 * Operação de leitura — sem lock.
 *
 * @param {string} processoId
 * @returns {{success: boolean, data: Array<Object>, message: string}}
 */
function consultarEtapas(processoId) {
  try {
    var rows = DAL.readWhere(SHEET.ETAPAS, function(row) {
      return String(row[COL_ETAPA.ID_PROCESSO - 1]) === processoId;
    });

    var etapas = rows.map(function(r) {
      return {
        idProcesso:    r.data[COL_ETAPA.ID_PROCESSO - 1],
        num:           r.data[COL_ETAPA.NUM - 1],
        etapa:         r.data[COL_ETAPA.ETAPA - 1],
        responsavel:   r.data[COL_ETAPA.RESPONSAVEL - 1],
        status:        r.data[COL_ETAPA.STATUS - 1],
        dataInicio:    r.data[COL_ETAPA.DATA_INICIO - 1],
        dataConclusao: r.data[COL_ETAPA.DATA_CONCLUSAO - 1],
        prazoLimite:   r.data[COL_ETAPA.PRAZO_LIMITE - 1],
        documentoRef:  r.data[COL_ETAPA.DOCUMENTO_REF - 1],
        observacoes:   r.data[COL_ETAPA.OBSERVACOES - 1],
        rowIndex:      r.rowIndex
      };
    });

    // Ordenar por número da etapa
    etapas.sort(function(a, b) { return a.num - b.num; });

    return {
      success: true,
      data: etapas,
      message: etapas.length + ' etapa(s) encontrada(s).'
    };
  } catch (e) {
    return { success: false, data: [], message: 'Erro ao consultar etapas: ' + e.message };
  }
}

/**
 * Conclui uma etapa e avança automaticamente para a próxima não-N/A.
 * Atualiza o campo "Etapa Atual" no processo pai.
 * Se todas forem concluídas, marca o processo como "Concluído".
 *
 * @param {string} processoId
 * @param {number} etapaNum - Número da etapa sendo concluída (1-23)
 * @returns {{success: boolean, message: string, nextStage: number|null}}
 */
function concluirEtapa(processoId, etapaNum) {
  return withDocumentLock(function() {
    // 1. Ler todas as etapas do processo
    var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
      return String(row[COL_ETAPA.ID_PROCESSO - 1]) === processoId;
    });

    if (stageRows.length === 0) {
      return { success: false, message: 'Etapas nao encontradas para ' + processoId, nextStage: null };
    }

    // Ordenar por número
    stageRows.sort(function(a, b) {
      return a.data[COL_ETAPA.NUM - 1] - b.data[COL_ETAPA.NUM - 1];
    });

    // 2. Encontrar e marcar etapa atual como Concluída
    var current = null;
    for (var i = 0; i < stageRows.length; i++) {
      if (stageRows[i].data[COL_ETAPA.NUM - 1] === etapaNum) {
        current = stageRows[i];
        break;
      }
    }

    if (!current) {
      return { success: false, message: 'Etapa ' + etapaNum + ' nao encontrada.', nextStage: null };
    }

    if (current.data[COL_ETAPA.STATUS - 1] === STATUS.CONCLUIDO) {
      return { success: false, message: 'Etapa ' + etapaNum + ' ja esta concluida.', nextStage: null };
    }

    current.data[COL_ETAPA.STATUS - 1]          = STATUS.CONCLUIDO;
    current.data[COL_ETAPA.DATA_CONCLUSAO - 1]   = new Date();
    DAL.updateRow(SHEET.ETAPAS, current.rowIndex, current.data);

    // 3. Encontrar próxima etapa não-N/A e Pendente
    var nextStage = null;
    for (var j = 0; j < stageRows.length; j++) {
      var s = stageRows[j];
      if (s.data[COL_ETAPA.NUM - 1] > etapaNum
          && s.data[COL_ETAPA.STATUS - 1] === STATUS.PENDENTE) {
        nextStage = s;
        break;
      }
    }

    if (nextStage) {
      // Ativar próxima etapa
      nextStage.data[COL_ETAPA.STATUS - 1]      = STATUS.EM_ANDAMENTO;
      nextStage.data[COL_ETAPA.DATA_INICIO - 1]  = new Date();
      DAL.updateRow(SHEET.ETAPAS, nextStage.rowIndex, nextStage.data);

      // Atualizar "Etapa Atual" no processo
      var nextLabel = nextStage.data[COL_ETAPA.NUM - 1] + '. ' + nextStage.data[COL_ETAPA.ETAPA - 1];
      atualizarEtapaAtualProcesso_(processoId, nextLabel);

      logAction('CONCLUIR_ETAPA', processoId + ' - etapa ' + etapaNum
                + ' concluida. Proxima: ' + nextStage.data[COL_ETAPA.NUM - 1]);

      return {
        success: true,
        message: 'Etapa ' + etapaNum + ' concluida. Proxima: '
                 + nextStage.data[COL_ETAPA.NUM - 1] + '. ' + nextStage.data[COL_ETAPA.ETAPA - 1],
        nextStage: nextStage.data[COL_ETAPA.NUM - 1]
      };
    } else {
      // Verificar se TODAS as etapas estão concluídas ou N/A
      var allDone = stageRows.every(function(s) {
        var st = s.data[COL_ETAPA.STATUS - 1];
        return st === STATUS.CONCLUIDO || st === STATUS.NAO_APLICAVEL;
      });

      if (allDone) {
        atualizarStatusProcesso_(processoId, STATUS.CONCLUIDO);
        logAction('CONCLUIR_PROCESSO', processoId + ' - todas as etapas concluidas');
        return {
          success: true,
          message: 'Todas as etapas concluidas. Processo ' + processoId + ' finalizado.',
          nextStage: null
        };
      }

      logAction('CONCLUIR_ETAPA', processoId + ' - etapa ' + etapaNum + ' concluida (sem proxima pendente)');
      return {
        success: true,
        message: 'Etapa ' + etapaNum + ' concluida.',
        nextStage: null
      };
    }
  }, 'concluirEtapa');
}

/**
 * Atualiza campos de uma etapa específica (datas, docs, observações).
 *
 * @param {string} processoId
 * @param {number} etapaNum
 * @param {Object} updates - Campos a atualizar
 * @param {Date}   [updates.prazoLimite]
 * @param {string} [updates.documentoRef]
 * @param {string} [updates.observacoes]
 * @returns {{success: boolean, message: string}}
 */
function atualizarEtapa(processoId, etapaNum, updates) {
  return withDocumentLock(function() {
    var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
      return String(row[COL_ETAPA.ID_PROCESSO - 1]) === processoId
          && row[COL_ETAPA.NUM - 1] === etapaNum;
    });

    if (stageRows.length === 0) {
      return { success: false, message: 'Etapa nao encontrada.' };
    }

    var stage = stageRows[0];

    if (updates.prazoLimite !== undefined) {
      stage.data[COL_ETAPA.PRAZO_LIMITE - 1] = updates.prazoLimite;
    }
    if (updates.documentoRef !== undefined) {
      stage.data[COL_ETAPA.DOCUMENTO_REF - 1] = normalizeString(updates.documentoRef);
    }
    if (updates.observacoes !== undefined) {
      stage.data[COL_ETAPA.OBSERVACOES - 1] = normalizeString(updates.observacoes);
    }

    DAL.updateRow(SHEET.ETAPAS, stage.rowIndex, stage.data);

    logAction('ATUALIZAR_ETAPA', processoId + ' - etapa ' + etapaNum + ' atualizada');

    return { success: true, message: 'Etapa ' + etapaNum + ' atualizada.' };
  }, 'atualizarEtapa');
}

/**
 * Retorna a etapa atualmente ativa (Em Andamento) de um processo.
 * Sem lock (leitura).
 *
 * @param {string} processoId
 * @returns {{num: number, name: string, responsible: string}|null}
 */
function getEtapaAtual(processoId) {
  var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
    return String(row[COL_ETAPA.ID_PROCESSO - 1]) === processoId
        && row[COL_ETAPA.STATUS - 1] === STATUS.EM_ANDAMENTO;
  });

  if (stageRows.length === 0) return null;

  var s = stageRows[0].data;
  return {
    num: s[COL_ETAPA.NUM - 1],
    name: s[COL_ETAPA.ETAPA - 1],
    responsible: s[COL_ETAPA.RESPONSAVEL - 1]
  };
}

/**
 * Calcula dias em aberto desde a abertura do processo.
 * @param {Date} dataAbertura
 * @returns {number}
 */
function calcularDiasAberto(dataAbertura) {
  if (!dataAbertura || !(dataAbertura instanceof Date)) return 0;
  return Math.max(0, diffDays(new Date(), dataAbertura));
}

/**
 * Encontra a data da última transição de etapa (mais recente Data Conclusão).
 * @param {string} processoId
 * @param {Array<Array<any>>} [allEtapas] - se já carregado, passa para evitar releitura
 * @returns {Date|null}
 */
function getLastTransitionDate_(processoId, allEtapas) {
  var etapas = allEtapas || DAL.readAll(SHEET.ETAPAS);
  var lastDate = null;

  for (var i = 0; i < etapas.length; i++) {
    var row = etapas[i];
    // Se allEtapas é o resultado direto de readAll, row é Array; senão pode ser objeto
    var rowData = Array.isArray(row) ? row : row.data;
    if (String(rowData[COL_ETAPA.ID_PROCESSO - 1]) !== processoId) continue;

    var dataConclusao = rowData[COL_ETAPA.DATA_CONCLUSAO - 1];
    if (dataConclusao instanceof Date && !isNaN(dataConclusao.getTime())) {
      if (!lastDate || dataConclusao > lastDate) {
        lastDate = dataConclusao;
      }
    }
  }

  return lastDate;
}

// ── Helpers internos (atualizam Processos de dentro do lock) ──

/**
 * Atualiza o campo "Etapa Atual" de um processo.
 * DEVE ser chamada dentro de withDocumentLock().
 * @param {string} processoId
 * @param {string} etapaLabel - Ex: "3. Cadastro do Terceiro (Portal)"
 */
function atualizarEtapaAtualProcesso_(processoId, etapaLabel) {
  var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, processoId);
  if (proc) {
    proc.data[COL_PROC.ETAPA_ATUAL - 1] = etapaLabel;
    DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, proc.data);
  }
}

/**
 * Atualiza o Status Geral de um processo.
 * DEVE ser chamada dentro de withDocumentLock().
 * @param {string} processoId
 * @param {string} novoStatus
 */
function atualizarStatusProcesso_(processoId, novoStatus) {
  var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, processoId);
  if (proc) {
    proc.data[COL_PROC.STATUS_GERAL - 1] = novoStatus;
    DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, proc.data);
  }
}
