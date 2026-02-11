/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Sistema de Alertas
 * ============================================================
 */

function installTriggers() {
  removeTriggers();
  ScriptApp.newTrigger('executarAlertasDiarios').timeBased().atHour(8).everyDays(1).inTimezone('America/Sao_Paulo').create();
  ScriptApp.newTrigger('executarRelatorioSemanal').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(9).inTimezone('America/Sao_Paulo').create();
  ScriptApp.newTrigger('refreshDashboard').timeBased().everyHours(4).create();
  logAction('TRIGGERS', 'Triggers instalados com sucesso');
}

function removeTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) ScriptApp.deleteTrigger(triggers[i]);
}

function executarAlertasDiarios() {
  try {
    var hoje = new Date();
    var thresholds = getAlertThresholds_();
    var alerts = [];
    var aquisicoes = DAL.readAll(SHEET.AQUISICOES);
    var etapas = DAL.readAll(SHEET.ETAPAS);
    for (var i = 0; i < aquisicoes.length; i++) {
      var aq = aquisicoes[i];
      var id = aq[COL_AQUIS.ID - 1];
      var status = aq[COL_AQUIS.STATUS_GERAL - 1];
      if (status !== STATUS.EM_ANDAMENTO) continue;
      for (var j = 0; j < etapas.length; j++) {
        var etapa = etapas[j];
        if (String(etapa[COL_ETAPA.ID_AQUISICAO - 1]) !== String(id)) continue;
        if (etapa[COL_ETAPA.STATUS - 1] !== STATUS.EM_ANDAMENTO) continue;
        var prazoLimite = etapa[COL_ETAPA.PRAZO_LIMITE - 1];
        if (prazoLimite instanceof Date) {
          var diasAte = diffDays(prazoLimite, hoje);
          if (diasAte < 0) {
            alerts.push({ type: 'VENCIDO', processo: id, etapa: etapa[COL_ETAPA.NUM - 1] + '. ' + etapa[COL_ETAPA.ETAPA - 1], detail: 'Atrasado em ' + Math.abs(diasAte) + ' dia(s)', responsible: etapa[COL_ETAPA.RESPONSAVEL - 1] });
          } else if (diasAte <= thresholds.overdueWarningDays) {
            alerts.push({ type: 'PROXIMO_VENCIMENTO', processo: id, etapa: etapa[COL_ETAPA.NUM - 1] + '. ' + etapa[COL_ETAPA.ETAPA - 1], detail: 'Vence em ' + diasAte + ' dia(s)', responsible: etapa[COL_ETAPA.RESPONSAVEL - 1] });
          }
        }
      }
      var lastTransition = getLastTransitionDate_(id, etapas);
      if (lastTransition) {
        var diasParado = diffDays(hoje, lastTransition);
        if (diasParado >= thresholds.staleDays) {
          alerts.push({ type: 'AQUISICAO_PARADA', processo: id, etapa: aq[COL_AQUIS.ETAPA_ATUAL - 1], detail: 'Sem movimentacao ha ' + diasParado + ' dia(s)', responsible: 'DINT' });
        }
      }
    }
    var fornecedores = DAL.readAll(SHEET.FORNECEDORES);
    for (var k = 0; k < fornecedores.length; k++) {
      var forn = fornecedores[k];
      var valCred = forn[COL_FORN.VALIDADE_CREDENCIAMENTO - 1];
      if (valCred instanceof Date) {
        var diasCredencial = diffDays(valCred, hoje);
        if (diasCredencial > 0 && diasCredencial <= thresholds.credentialWarningDays) {
          alerts.push({ type: 'CREDENCIAMENTO_VENCENDO', processo: '', etapa: '', detail: forn[COL_FORN.RAZAO_SOCIAL - 1] + ' - credenciamento vence em ' + diasCredencial + ' dia(s)', responsible: 'DINT' });
        } else if (diasCredencial <= 0) {
          alerts.push({ type: 'CREDENCIAMENTO_VENCIDO', processo: '', etapa: '', detail: forn[COL_FORN.RAZAO_SOCIAL - 1] + ' - credenciamento VENCIDO ha ' + Math.abs(diasCredencial) + ' dia(s)', responsible: 'DINT' });
        }
      }
    }
    if (alerts.length > 0) {
      enviarEmailAlertas_(alerts);
      withDocumentLock(function() { atualizarColunasAlerta_(aquisicoes, alerts); }, 'atualizarAlertasDiarios');
    }
    logAction('ALERTAS_DIARIOS', alerts.length + ' alerta(s) identificado(s)');
  } catch (e) { logAction('ERRO_ALERTAS', 'Falha nos alertas diarios: ' + e.message); }
}

function executarRelatorioSemanal() {
  try {
    var kpis = computeKPIs();
    var hoje = new Date();
    var html = '<h2>Workflow ADM DINT 2.0 - Relatorio Semanal</h2>'
      + '<p><strong>Data:</strong> ' + formatDateBR(hoje) + '</p><hr>'
      + '<h3>Resumo Geral</h3>'
      + '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">'
      + '<tr><th>Indicador</th><th>Valor</th></tr>'
      + '<tr><td>Total de Aquisicoes</td><td>' + kpis.totalAquisicoes + '</td></tr>'
      + '<tr><td>Em Andamento</td><td>' + kpis.emAndamento + '</td></tr>'
      + '<tr><td>Concluidos</td><td>' + kpis.concluidos + '</td></tr>'
      + '<tr><td>Cancelados</td><td>' + kpis.cancelados + '</td></tr>'
      + '<tr><td>Suspensos</td><td>' + kpis.suspensos + '</td></tr>'
      + '<tr><td>Media Dias em Aberto</td><td>' + kpis.mediadiasAberto + '</td></tr>'
      + '<tr><td>Valor Total Estimado</td><td>' + formatCurrency(kpis.valorTotal) + '</td></tr>'
      + '</table>';
    var tipos = Object.keys(kpis.porTipo);
    if (tipos.length > 0) {
      html += '<h3>Por Tipo de Contratacao</h3><table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;"><tr><th>Tipo</th><th>Qtd</th></tr>';
      for (var t = 0; t < tipos.length; t++) html += '<tr><td>' + tipos[t] + '</td><td>' + kpis.porTipo[tipos[t]] + '</td></tr>';
      html += '</table>';
    }
    html += '<hr><p style="color:#888;font-size:11px;">Workflow ADM DINT 2.0 - Relatorio automatico</p>';
    var recipients = getAlertRecipients_();
    MailApp.sendEmail({ to: recipients, subject: 'Workflow ADM DINT 2.0 - Relatorio Semanal - ' + formatDateBR(hoje), htmlBody: html });
    logAction('RELATORIO_SEMANAL', 'Enviado para ' + recipients);
  } catch (e) { logAction('ERRO_RELATORIO', 'Falha: ' + e.message); }
}

function getAlertasAtivos() {
  try {
    var alerts = [];
    var aquisicoes = DAL.readAll(SHEET.AQUISICOES);
    for (var i = 0; i < aquisicoes.length; i++) {
      var alertText = aquisicoes[i][COL_AQUIS.ALERTAS - 1];
      if (alertText) {
        alerts.push({ processo: aquisicoes[i][COL_AQUIS.ID - 1], descricao: aquisicoes[i][COL_AQUIS.DESCRICAO - 1], alerta: alertText, etapaAtual: aquisicoes[i][COL_AQUIS.ETAPA_ATUAL - 1] });
      }
    }
    return { success: true, data: alerts, message: alerts.length + ' alerta(s) ativo(s).' };
  } catch (e) { return { success: false, data: [], message: 'Erro: ' + e.message }; }
}

function getConfigAlertas() {
  return { recipients: getAlertRecipients_(), thresholds: getAlertThresholds_() };
}

function salvarConfigAlertas(config) {
  try {
    if (config.recipients) setScriptConfig('ALERT_RECIPIENTS', config.recipients);
    if (config.thresholds) setScriptConfig('ALERT_THRESHOLDS', JSON.stringify(config.thresholds));
    logAction('CONFIG_ALERTAS', 'Configuracao de alertas atualizada');
    return { success: true, message: 'Configuracao salva.' };
  } catch (e) { return { success: false, message: 'Erro: ' + e.message }; }
}

function getAlertRecipients_() { return getScriptConfig('ALERT_RECIPIENTS') || ''; }

function getAlertThresholds_() {
  var prop = getScriptConfig('ALERT_THRESHOLDS');
  if (prop) { try { return JSON.parse(prop); } catch (e) {} }
  return { overdueWarningDays: ALERT_DEFAULTS.OVERDUE_WARNING_DAYS, staleDays: ALERT_DEFAULTS.STALE_DAYS, credentialWarningDays: ALERT_DEFAULTS.CREDENTIAL_WARNING_DAYS };
}

function enviarEmailAlertas_(alerts) {
  var recipients = getAlertRecipients_();
  if (!recipients) return;
  var hoje = formatDateBR(new Date());
  var html = '<h2>Workflow ADM DINT 2.0 - Alertas Diarios</h2><p><strong>Data:</strong> ' + hoje + '</p><p><strong>' + alerts.length + ' alerta(s)</strong></p><hr>'
    + '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;"><tr style="background:#f0f0f0;"><th>Tipo</th><th>Aquisicao</th><th>Etapa</th><th>Detalhe</th><th>Responsavel</th></tr>';
  for (var i = 0; i < alerts.length; i++) {
    var a = alerts[i];
    var bgColor = a.type === 'VENCIDO' || a.type === 'CREDENCIAMENTO_VENCIDO' ? '#ffe0e0' : '#fff3cd';
    html += '<tr style="background:' + bgColor + ';"><td>' + a.type + '</td><td>' + a.processo + '</td><td>' + a.etapa + '</td><td>' + a.detail + '</td><td>' + a.responsible + '</td></tr>';
  }
  html += '</table><hr><p style="color:#888;font-size:11px;">Workflow ADM DINT 2.0 - Alerta automatico</p>';
  MailApp.sendEmail({ to: recipients, subject: 'Workflow ADM DINT 2.0 - ' + alerts.length + ' Alerta(s) - ' + hoje, htmlBody: html });
}

function atualizarColunasAlerta_(aquisicoes, alerts) {
  var alertsPorAquisicao = {};
  for (var i = 0; i < alerts.length; i++) {
    var a = alerts[i];
    if (a.processo) {
      if (!alertsPorAquisicao[a.processo]) alertsPorAquisicao[a.processo] = [];
      alertsPorAquisicao[a.processo].push(a.type + ': ' + a.detail);
    }
  }
  for (var j = 0; j < aquisicoes.length; j++) {
    var aqId = aquisicoes[j][COL_AQUIS.ID - 1];
    var alertTexts = alertsPorAquisicao[aqId];
    var newAlertValue = alertTexts ? alertTexts.join(' | ') : '';
    if (String(aquisicoes[j][COL_AQUIS.ALERTAS - 1]) !== newAlertValue) {
      DAL.updateCell(SHEET.AQUISICOES, j + 2, COL_AQUIS.ALERTAS, newAlertValue);
    }
  }
}
