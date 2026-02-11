/**
 * ============================================================
 * WORKFLOW DINT 2.0 — Dashboard
 * ============================================================
 * Cálculo de KPIs, dados para gráficos e atualização
 * da aba Dashboard.
 * ============================================================
 */

/**
 * Computa todos os KPIs a partir dos dados de Processos e Etapas.
 * Função pura de cálculo — SEM lock.
 *
 * @returns {Object} KPIs calculados
 */
function computeKPIs() {
  var processos = DAL.readAll(SHEET.PROCESSOS);
  var hoje = new Date();

  var kpis = {
    totalProcessos:    processos.length,
    emAndamento:       0,
    concluidos:        0,
    cancelados:        0,
    suspensos:         0,
    mediadiasAberto:   0,
    porTipo:           {},
    porEtapaAtual:     {},
    volumeMensal:      {},
    valorTotal:        0
  };

  var somadiasAberto = 0;
  var countAtivos = 0;

  for (var i = 0; i < processos.length; i++) {
    var proc = processos[i];
    var status = proc[COL_PROC.STATUS_GERAL - 1];
    var tipo = proc[COL_PROC.TIPO_CONTRATACAO - 1] || 'Nao informado';
    var etapaAtual = proc[COL_PROC.ETAPA_ATUAL - 1] || 'N/A';
    var valor = parseFloat(proc[COL_PROC.VALOR_ESTIMADO - 1]) || 0;
    var dataAbertura = proc[COL_PROC.DATA_ABERTURA - 1];

    // Contagem por status
    switch (status) {
      case STATUS.EM_ANDAMENTO: kpis.emAndamento++; break;
      case STATUS.CONCLUIDO:    kpis.concluidos++;   break;
      case STATUS.CANCELADO:    kpis.cancelados++;   break;
      case STATUS.SUSPENSO:     kpis.suspensos++;    break;
    }

    // Valor total
    kpis.valorTotal += valor;

    // Dias em aberto (apenas ativos)
    if (status === STATUS.EM_ANDAMENTO && dataAbertura instanceof Date) {
      var dias = calcularDiasAberto(dataAbertura);
      somadiasAberto += dias;
      countAtivos++;
    }

    // Por tipo de contratação
    kpis.porTipo[tipo] = (kpis.porTipo[tipo] || 0) + 1;

    // Por etapa atual (apenas ativos)
    if (status === STATUS.EM_ANDAMENTO) {
      kpis.porEtapaAtual[etapaAtual] = (kpis.porEtapaAtual[etapaAtual] || 0) + 1;
    }

    // Volume mensal (por mês/ano de abertura)
    if (dataAbertura instanceof Date) {
      var mesAno = Utilities.formatDate(dataAbertura, 'America/Sao_Paulo', 'MM/yyyy');
      kpis.volumeMensal[mesAno] = (kpis.volumeMensal[mesAno] || 0) + 1;
    }
  }

  kpis.mediadiasAberto = countAtivos > 0 ? Math.round(somadiasAberto / countAtivos) : 0;

  return kpis;
}

/**
 * Atualiza a aba Dashboard com os KPIs calculados.
 * LOCKED (escreve na aba Dashboard).
 *
 * @returns {{success: boolean, message: string}}
 */
function refreshDashboard() {
  try {
    return withDocumentLock(function() {
      var kpis = computeKPIs();

      // Layout do Dashboard:
      // Linha 1: Título
      // Linha 2-3: KPIs principais
      // Linha 5+: Tabela por status
      // Linha 10+: Tabela por tipo
      // Linha 16+: Volume mensal

      // KPIs principais (Linha 2-3)
      var kpiData = [
        ['Total Processos', 'Em Andamento', 'Concluidos', 'Cancelados', 'Suspensos', 'Media Dias Aberto', 'Valor Total Estimado'],
        [kpis.totalProcessos, kpis.emAndamento, kpis.concluidos, kpis.cancelados, kpis.suspensos, kpis.mediadiasAberto, formatCurrency(kpis.valorTotal)]
      ];
      DAL.writeBlock(SHEET.DASHBOARD, 2, 1, kpiData);

      // Tabela por tipo de contratação (Linha 5+)
      var tipoHeader = [['Tipo Contratacao', 'Quantidade']];
      var tipoRows = [];
      var tipos = Object.keys(kpis.porTipo);
      for (var t = 0; t < tipos.length; t++) {
        tipoRows.push([tipos[t], kpis.porTipo[tipos[t]]]);
      }
      if (tipoRows.length > 0) {
        DAL.writeBlock(SHEET.DASHBOARD, 5, 1, tipoHeader.concat(tipoRows));
      }

      // Tabela por etapa atual (Linha 5, coluna 4+)
      var etapaHeader = [['Etapa Atual', 'Quantidade']];
      var etapaRows = [];
      var etapas = Object.keys(kpis.porEtapaAtual);
      for (var e = 0; e < etapas.length; e++) {
        etapaRows.push([etapas[e], kpis.porEtapaAtual[etapas[e]]]);
      }
      if (etapaRows.length > 0) {
        DAL.writeBlock(SHEET.DASHBOARD, 5, 4, etapaHeader.concat(etapaRows));
      }

      // Volume mensal (Linha 5, coluna 7+)
      var volHeader = [['Mes/Ano', 'Quantidade']];
      var volRows = [];
      var meses = Object.keys(kpis.volumeMensal).sort();
      for (var m = 0; m < meses.length; m++) {
        volRows.push([meses[m], kpis.volumeMensal[meses[m]]]);
      }
      if (volRows.length > 0) {
        DAL.writeBlock(SHEET.DASHBOARD, 5, 7, volHeader.concat(volRows));
      }

      logAction('DASHBOARD', 'Dashboard atualizado - ' + kpis.totalProcessos + ' processos');

      return { success: true, message: 'Dashboard atualizado.' };
    }, 'refreshDashboard');
  } catch (e) {
    return { success: false, message: 'Erro ao atualizar dashboard: ' + e.message };
  }
}

/**
 * Retorna dados do dashboard em formato JSON para gráficos do sidebar.
 * SEM lock (leitura).
 *
 * @returns {{success: boolean, data: Object, message: string}}
 */
function getDashboardData() {
  try {
    var kpis = computeKPIs();
    return {
      success: true,
      data: kpis,
      message: 'Dados do dashboard carregados.'
    };
  } catch (e) {
    return { success: false, data: null, message: 'Erro: ' + e.message };
  }
}
