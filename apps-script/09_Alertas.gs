/**
 * ============================================================
 * WORKFLOW DINT 2.0 — Sistema de Alertas
 * ============================================================
 * Avaliação de condições de alerta, envio de emails,
 * gerenciamento de triggers (diário, semanal, dashboard).
 * ============================================================
 */

// ── Gerenciamento de Triggers ───────────────────────────────

/**
 * Instala os triggers de tempo (diário, semanal, dashboard).
 * Idempotente: remove triggers existentes antes de criar.
 * Deve ser executado pelo owner da planilha.
 */
function installTriggers() {
  removeTriggers();

  // Alertas diários às 8h (Brasília)
  ScriptApp.newTrigger('executarAlertasDiarios')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .inTimezone('America/Sao_Paulo')
    .create();

  // Relatório semanal — segunda às 9h
  ScriptApp.newTrigger('executarRelatorioSemanal')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .inTimezone('America/Sao_Paulo')
    .create();

  // Refresh do dashboard a cada 4h
  ScriptApp.newTrigger('refreshDashboard')
    .timeBased()
    .everyHours(4)
    .create();

  logAction('TRIGGERS', 'Triggers instalados com sucesso');
}

/**
 * Remove todos os triggers do projeto.
 */
function removeTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

// ── Alertas Diários ─────────────────────────────────────────

/**
 * Avalia todas as condições de alerta e envia email consolidado.
 * Executado via trigger diário às 8h.
 *
 * Condições:
 * 1. Etapa vencida (prazo ultrapassado)
 * 2. Próximo vencimento (dentro de X dias)
 * 3. Processo parado (sem movimentação há X dias)
 * 4. Credenciamento de fornecedor vencendo (dentro de X dias)
 */
function executarAlertasDiarios() {
  try {
    var hoje = new Date();
    var thresholds = getAlertThresholds_();
    var alerts = [];

    // ── Alertas de Processos/Etapas ───────────────────────
    var processos = DAL.readAll(SHEET.PROCESSOS);
    var etapas = DAL.readAll(SHEET.ETAPAS);

    for (var i = 0; i < processos.length; i++) {
      var proc = processos[i];
      var id = proc[COL_PROC.ID - 1];
      var status = proc[COL_PROC.STATUS_GERAL - 1];

      if (status !== STATUS.EM_ANDAMENTO) continue;

      // Encontrar etapas ativas deste processo
      for (var j = 0; j < etapas.length; j++) {
        var etapa = etapas[j];
        if (String(etapa[COL_ETAPA.ID_PROCESSO - 1]) !== String(id)) continue;
        if (etapa[COL_ETAPA.STATUS - 1] !== STATUS.EM_ANDAMENTO) continue;

        var prazoLimite = etapa[COL_ETAPA.PRAZO_LIMITE - 1];
        if (prazoLimite instanceof Date) {
          var diasAte = diffDays(prazoLimite, hoje);

          if (diasAte < 0) {
            alerts.push({
              type: 'VENCIDO',
              processo: id,
              etapa: etapa[COL_ETAPA.NUM - 1] + '. ' + etapa[COL_ETAPA.ETAPA - 1],
              detail: 'Atrasado em ' + Math.abs(diasAte) + ' dia(s)',
              responsible: etapa[COL_ETAPA.RESPONSAVEL - 1]
            });
          } else if (diasAte <= thresholds.overdueWarningDays) {
            alerts.push({
              type: 'PROXIMO_VENCIMENTO',
              processo: id,
              etapa: etapa[COL_ETAPA.NUM - 1] + '. ' + etapa[COL_ETAPA.ETAPA - 1],
              detail: 'Vence em ' + diasAte + ' dia(s)',
              responsible: etapa[COL_ETAPA.RESPONSAVEL - 1]
            });
          }
        }
      }

      // Processo parado
      var lastTransition = getLastTransitionDate_(id, etapas);
      if (lastTransition) {
        var diasParado = diffDays(hoje, lastTransition);
        if (diasParado >= thresholds.staleDays) {
          alerts.push({
            type: 'PROCESSO_PARADO',
            processo: id,
            etapa: proc[COL_PROC.ETAPA_ATUAL - 1],
            detail: 'Sem movimentacao ha ' + diasParado + ' dia(s)',
            responsible: 'DINT'
          });
        }
      }
    }

    // ── Alertas de Fornecedores ───────────────────────────
    var fornecedores = DAL.readAll(SHEET.FORNECEDORES);

    for (var k = 0; k < fornecedores.length; k++) {
      var forn = fornecedores[k];
      var valCred = forn[COL_FORN.VALIDADE_CREDENCIAMENTO - 1];

      if (valCred instanceof Date) {
        var diasCredencial = diffDays(valCred, hoje);
        if (diasCredencial > 0 && diasCredencial <= thresholds.credentialWarningDays) {
          alerts.push({
            type: 'CREDENCIAMENTO_VENCENDO',
            processo: '',
            etapa: '',
            detail: forn[COL_FORN.RAZAO_SOCIAL - 1] + ' - credenciamento vence em '
                    + diasCredencial + ' dia(s)',
            responsible: 'DINT'
          });
        } else if (diasCredencial <= 0) {
          alerts.push({
            type: 'CREDENCIAMENTO_VENCIDO',
            processo: '',
            etapa: '',
            detail: forn[COL_FORN.RAZAO_SOCIAL - 1] + ' - credenciamento VENCIDO ha '
                    + Math.abs(diasCredencial) + ' dia(s)',
            responsible: 'DINT'
          });
        }
      }
    }

    // ── Enviar email e atualizar colunas ──────────────────
    if (alerts.length > 0) {
      enviarEmailAlertas_(alerts);

      // Atualizar coluna Alertas nos processos
      withDocumentLock(function() {
        atualizarColunasAlerta_(processos, alerts);
      }, 'atualizarAlertasDiarios');
    }

    logAction('ALERTAS_DIARIOS', alerts.length + ' alerta(s) identificado(s)');
  } catch (e) {
    logAction('ERRO_ALERTAS', 'Falha nos alertas diarios: ' + e.message);
  }
}

// ── Relatório Semanal ───────────────────────────────────────

/**
 * Gera e envia relatório semanal por email.
 * Executado via trigger semanal (segunda 9h).
 */
function executarRelatorioSemanal() {
  try {
    var kpis = computeKPIs();
    var hoje = new Date();

    var html = '<h2>Workflow DINT 2.0 - Relatorio Semanal</h2>'
      + '<p><strong>Data:</strong> ' + formatDateBR(hoje) + '</p>'
      + '<hr>'
      + '<h3>Resumo Geral</h3>'
      + '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">'
      + '<tr><th>Indicador</th><th>Valor</th></tr>'
      + '<tr><td>Total de Processos</td><td>' + kpis.totalProcessos + '</td></tr>'
      + '<tr><td>Em Andamento</td><td>' + kpis.emAndamento + '</td></tr>'
      + '<tr><td>Concluidos</td><td>' + kpis.concluidos + '</td></tr>'
      + '<tr><td>Cancelados</td><td>' + kpis.cancelados + '</td></tr>'
      + '<tr><td>Suspensos</td><td>' + kpis.suspensos + '</td></tr>'
      + '<tr><td>Media Dias em Aberto</td><td>' + kpis.mediadiasAberto + '</td></tr>'
      + '<tr><td>Valor Total Estimado</td><td>' + formatCurrency(kpis.valorTotal) + '</td></tr>'
      + '</table>';

    // Tabela por tipo
    var tipos = Object.keys(kpis.porTipo);
    if (tipos.length > 0) {
      html += '<h3>Por Tipo de Contratacao</h3>'
        + '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">'
        + '<tr><th>Tipo</th><th>Qtd</th></tr>';
      for (var t = 0; t < tipos.length; t++) {
        html += '<tr><td>' + tipos[t] + '</td><td>' + kpis.porTipo[tipos[t]] + '</td></tr>';
      }
      html += '</table>';
    }

    html += '<hr><p style="color:#888;font-size:11px;">Workflow DINT 2.0 - Relatorio automatico</p>';

    var recipients = getAlertRecipients_();
    MailApp.sendEmail({
      to: recipients,
      subject: 'Workflow DINT 2.0 - Relatorio Semanal - ' + formatDateBR(hoje),
      htmlBody: html
    });

    logAction('RELATORIO_SEMANAL', 'Enviado para ' + recipients);
  } catch (e) {
    logAction('ERRO_RELATORIO', 'Falha no relatorio semanal: ' + e.message);
  }
}

// ── Consultas de Alertas (para UI) ──────────────────────────

/**
 * Retorna alertas ativos para exibição no painel.
 * SEM lock.
 *
 * @returns {{success: boolean, data: Array<Object>, message: string}}
 */
function getAlertasAtivos() {
  try {
    var hoje = new Date();
    var thresholds = getAlertThresholds_();
    var alerts = [];

    var processos = DAL.readAll(SHEET.PROCESSOS);
    for (var i = 0; i < processos.length; i++) {
      var alertText = processos[i][COL_PROC.ALERTAS - 1];
      if (alertText) {
        alerts.push({
          processo: processos[i][COL_PROC.ID - 1],
          descricao: processos[i][COL_PROC.DESCRICAO - 1],
          alerta: alertText,
          etapaAtual: processos[i][COL_PROC.ETAPA_ATUAL - 1]
        });
      }
    }

    return {
      success: true,
      data: alerts,
      message: alerts.length + ' alerta(s) ativo(s).'
    };
  } catch (e) {
    return { success: false, data: [], message: 'Erro: ' + e.message };
  }
}

/**
 * Retorna configuração de alertas.
 * @returns {Object}
 */
function getConfigAlertas() {
  return {
    recipients: getAlertRecipients_(),
    thresholds: getAlertThresholds_()
  };
}

/**
 * Salva configuração de alertas.
 * @param {Object} config
 * @param {string} config.recipients - emails separados por vírgula
 * @param {Object} config.thresholds
 * @returns {{success: boolean, message: string}}
 */
function salvarConfigAlertas(config) {
  try {
    if (config.recipients) {
      setScriptConfig('ALERT_RECIPIENTS', config.recipients);
    }
    if (config.thresholds) {
      setScriptConfig('ALERT_THRESHOLDS', JSON.stringify(config.thresholds));
    }
    logAction('CONFIG_ALERTAS', 'Configuracao de alertas atualizada');
    return { success: true, message: 'Configuracao salva.' };
  } catch (e) {
    return { success: false, message: 'Erro: ' + e.message };
  }
}

// ── Helpers internos ────────────────────────────────────────

/**
 * Retorna lista de destinatários de alerta.
 * @returns {string}
 */
function getAlertRecipients_() {
  return getScriptConfig('ALERT_RECIPIENTS') || '';
}

/**
 * Retorna thresholds de alerta.
 * @returns {Object}
 */
function getAlertThresholds_() {
  var prop = getScriptConfig('ALERT_THRESHOLDS');
  if (prop) {
    try { return JSON.parse(prop); } catch (e) { /* fallback */ }
  }
  return {
    overdueWarningDays:     ALERT_DEFAULTS.OVERDUE_WARNING_DAYS,
    staleDays:              ALERT_DEFAULTS.STALE_DAYS,
    credentialWarningDays:  ALERT_DEFAULTS.CREDENTIAL_WARNING_DAYS
  };
}

/**
 * Envia email consolidado com alertas.
 * @param {Array<Object>} alerts
 */
function enviarEmailAlertas_(alerts) {
  var recipients = getAlertRecipients_();
  if (!recipients) return;

  var hoje = formatDateBR(new Date());
  var html = '<h2>Workflow DINT 2.0 - Alertas Diarios</h2>'
    + '<p><strong>Data:</strong> ' + hoje + '</p>'
    + '<p><strong>' + alerts.length + ' alerta(s) identificado(s)</strong></p>'
    + '<hr>'
    + '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">'
    + '<tr style="background:#f0f0f0;"><th>Tipo</th><th>Processo</th><th>Etapa</th><th>Detalhe</th><th>Responsavel</th></tr>';

  for (var i = 0; i < alerts.length; i++) {
    var a = alerts[i];
    var bgColor = a.type === 'VENCIDO' || a.type === 'CREDENCIAMENTO_VENCIDO' ? '#ffe0e0' : '#fff3cd';
    html += '<tr style="background:' + bgColor + ';">'
      + '<td>' + a.type + '</td>'
      + '<td>' + a.processo + '</td>'
      + '<td>' + a.etapa + '</td>'
      + '<td>' + a.detail + '</td>'
      + '<td>' + a.responsible + '</td>'
      + '</tr>';
  }

  html += '</table>'
    + '<hr><p style="color:#888;font-size:11px;">Workflow DINT 2.0 - Alerta automatico</p>';

  MailApp.sendEmail({
    to: recipients,
    subject: 'Workflow DINT 2.0 - ' + alerts.length + ' Alerta(s) - ' + hoje,
    htmlBody: html
  });
}

/**
 * Atualiza a coluna Alertas nos processos com base nos alertas identificados.
 * DEVE ser chamada dentro de withDocumentLock().
 *
 * @param {Array<Array<any>>} processos - Dados atuais de Processos
 * @param {Array<Object>} alerts - Alertas identificados
 */
function atualizarColunasAlerta_(processos, alerts) {
  // Agrupar alertas por processo
  var alertsPorProcesso = {};
  for (var i = 0; i < alerts.length; i++) {
    var a = alerts[i];
    if (a.processo) {
      if (!alertsPorProcesso[a.processo]) {
        alertsPorProcesso[a.processo] = [];
      }
      alertsPorProcesso[a.processo].push(a.type + ': ' + a.detail);
    }
  }

  // Atualizar coluna Alertas
  for (var j = 0; j < processos.length; j++) {
    var procId = processos[j][COL_PROC.ID - 1];
    var alertTexts = alertsPorProcesso[procId];
    var newAlertValue = alertTexts ? alertTexts.join(' | ') : '';

    // Só atualizar se mudou
    if (String(processos[j][COL_PROC.ALERTAS - 1]) !== newAlertValue) {
      DAL.updateCell(SHEET.PROCESSOS, j + 2, COL_PROC.ALERTAS, newAlertValue);
    }
  }
}
