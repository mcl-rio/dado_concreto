/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Dashboard
 * ============================================================
 */

function computeKPIs() {
  var aquisicoes = DAL.readAll(SHEET.AQUISICOES);
  var kpis = { totalAquisicoes: aquisicoes.length, emAndamento: 0, concluidos: 0, cancelados: 0, suspensos: 0, mediadiasAberto: 0, porTipo: {}, porEtapaAtual: {}, volumeMensal: {}, valorTotal: 0 };
  var somadiasAberto = 0;
  var countAtivos = 0;
  for (var i = 0; i < aquisicoes.length; i++) {
    var aq = aquisicoes[i];
    var status = aq[COL_AQUIS.STATUS_GERAL - 1];
    var tipo = aq[COL_AQUIS.TIPO_CONTRATACAO - 1] || 'Nao informado';
    var etapaAtual = aq[COL_AQUIS.ETAPA_ATUAL - 1] || 'N/A';
    var valor = parseFloat(aq[COL_AQUIS.VALOR_ESTIMADO - 1]) || 0;
    var dataAbertura = aq[COL_AQUIS.DATA_ABERTURA - 1];
    switch (status) {
      case STATUS.EM_ANDAMENTO: kpis.emAndamento++; break;
      case STATUS.CONCLUIDO: kpis.concluidos++; break;
      case STATUS.CANCELADO: kpis.cancelados++; break;
      case STATUS.SUSPENSO: kpis.suspensos++; break;
    }
    kpis.valorTotal += valor;
    if (status === STATUS.EM_ANDAMENTO && dataAbertura instanceof Date) {
      somadiasAberto += calcularDiasAberto(dataAbertura); countAtivos++;
    }
    kpis.porTipo[tipo] = (kpis.porTipo[tipo] || 0) + 1;
    if (status === STATUS.EM_ANDAMENTO) kpis.porEtapaAtual[etapaAtual] = (kpis.porEtapaAtual[etapaAtual] || 0) + 1;
    if (dataAbertura instanceof Date) {
      var mesAno = Utilities.formatDate(dataAbertura, 'America/Sao_Paulo', 'MM/yyyy');
      kpis.volumeMensal[mesAno] = (kpis.volumeMensal[mesAno] || 0) + 1;
    }
  }
  kpis.mediadiasAberto = countAtivos > 0 ? Math.round(somadiasAberto / countAtivos) : 0;
  return kpis;
}

function refreshDashboard() {
  try {
    return withDocumentLock(function() {
      var kpis = computeKPIs();
      var kpiData = [
        ['Total Aquisicoes', 'Em Andamento', 'Concluidos', 'Cancelados', 'Suspensos', 'Media Dias Aberto', 'Valor Total Estimado'],
        [kpis.totalAquisicoes, kpis.emAndamento, kpis.concluidos, kpis.cancelados, kpis.suspensos, kpis.mediadiasAberto, formatCurrency(kpis.valorTotal)]
      ];
      DAL.writeBlock(SHEET.DASHBOARD, 2, 1, kpiData);
      var tipoHeader = [['Tipo Contratacao', 'Quantidade']];
      var tipoRows = [];
      var tipos = Object.keys(kpis.porTipo);
      for (var t = 0; t < tipos.length; t++) tipoRows.push([tipos[t], kpis.porTipo[tipos[t]]]);
      if (tipoRows.length > 0) DAL.writeBlock(SHEET.DASHBOARD, 5, 1, tipoHeader.concat(tipoRows));
      var etapaHeader = [['Etapa Atual', 'Quantidade']];
      var etapaRows = [];
      var etapas = Object.keys(kpis.porEtapaAtual);
      for (var e = 0; e < etapas.length; e++) etapaRows.push([etapas[e], kpis.porEtapaAtual[etapas[e]]]);
      if (etapaRows.length > 0) DAL.writeBlock(SHEET.DASHBOARD, 5, 4, etapaHeader.concat(etapaRows));
      var volHeader = [['Mes/Ano', 'Quantidade']];
      var volRows = [];
      var meses = Object.keys(kpis.volumeMensal).sort();
      for (var m = 0; m < meses.length; m++) volRows.push([meses[m], kpis.volumeMensal[meses[m]]]);
      if (volRows.length > 0) DAL.writeBlock(SHEET.DASHBOARD, 5, 7, volHeader.concat(volRows));
      logAction('DASHBOARD', 'Dashboard atualizado - ' + kpis.totalAquisicoes + ' aquisicoes');
      return { success: true, message: 'Dashboard atualizado.' };
    }, 'refreshDashboard');
  } catch (e) { return { success: false, message: 'Erro: ' + e.message }; }
}

function getDashboardData() {
  try {
    var kpis = computeKPIs();
    return { success: true, data: kpis, message: 'Dados do dashboard carregados.' };
  } catch (e) { return { success: false, data: null, message: 'Erro: ' + e.message }; }
}
