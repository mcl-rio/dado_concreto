/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Gestao de Aquisicoes
 * ============================================================
 */

function criarAquisicao(formData) {
  try {
    return withDocumentLock(function() {
      var validation = validateRequired(formData, [
        'descricao', 'tipoContratacao', 'naturezaTerceiro',
        'naturezaContratacao', 'formaContratacao', 'valorEstimado'
      ]);
      if (!validation.valid) {
        return { success: false, message: 'Campos obrigatorios: ' + validation.missing.join(', '), data: null };
      }
      if (!isPositiveNumber(formData.valorEstimado)) {
        return { success: false, message: 'Valor estimado deve ser um numero positivo.', data: null };
      }

      var allAquisicoes = DAL.readAll(SHEET.AQUISICOES);
      var newId = generateNextId_(allAquisicoes);

      var flags = calcularRequisitos({
        tipoContratacao: formData.tipoContratacao,
        naturezaTerceiro: formData.naturezaTerceiro,
        naturezaContratacao: formData.naturezaContratacao,
        formaContratacao: formData.formaContratacao,
        valorEstimado: parseFloat(formData.valorEstimado)
      });

      var hoje = new Date();
      var prazoDias = parseInt(formData.prazoPrevisto, 10) || 30;
      var prazoPrevisto = new Date(hoje.getTime() + prazoDias * 24 * 60 * 60 * 1000);

      var newRow = new Array(24);
      newRow[COL_AQUIS.ID - 1]                   = newId;
      newRow[COL_AQUIS.STATUS_GERAL - 1]         = STATUS.EM_ANDAMENTO;
      newRow[COL_AQUIS.ETAPA_ATUAL - 1]          = '1. ' + STAGES[0].name;
      newRow[COL_AQUIS.DESCRICAO - 1]            = normalizeString(formData.descricao);
      newRow[COL_AQUIS.TIPO_CONTRATACAO - 1]     = formData.tipoContratacao;
      newRow[COL_AQUIS.NATUREZA_TERCEIRO - 1]    = formData.naturezaTerceiro;
      newRow[COL_AQUIS.NATUREZA_CONTRATACAO - 1] = formData.naturezaContratacao;
      newRow[COL_AQUIS.FORMA_CONTRATACAO - 1]    = formData.formaContratacao;
      newRow[COL_AQUIS.VALOR_ESTIMADO - 1]       = parseFloat(formData.valorEstimado);
      newRow[COL_AQUIS.FORNECEDOR - 1]           = normalizeString(formData.fornecedor || '');
      newRow[COL_AQUIS.CNPJ_CPF - 1]             = (formData.cnpjCpf || '').replace(/[^\d]/g, '');
      newRow[COL_AQUIS.CENTRO_CUSTO - 1]         = normalizeString(formData.centroCusto || '');
      newRow[COL_AQUIS.REQUISITANTE - 1]         = normalizeString(formData.requisitante || '');
      newRow[COL_AQUIS.DATA_ABERTURA - 1]        = hoje;
      newRow[COL_AQUIS.PRAZO_PREVISTO - 1]       = prazoPrevisto;
      newRow[COL_AQUIS.ESTRUTURA - 1]            = normalizeString(formData.estrutura || '');
      newRow[COL_AQUIS.OBSERVACOES - 1]          = normalizeString(formData.observacoes || '');
      newRow[COL_AQUIS.DIAS_ABERTO - 1]          = 0;
      newRow[COL_AQUIS.ALERTAS - 1]              = '';

      setProcessFlags_(newRow, flags);
      DAL.appendRow(SHEET.AQUISICOES, newRow);
      criarEtapasParaAquisicao_(newId);
      aplicarRequisitosEtapas_(newId, flags);

      logAction('CRIAR_AQUISICAO', 'Aquisicao ' + newId + ' criada - ' + formData.descricao + ' | ' + descreverRequisitos(flags));
      return { success: true, message: 'Aquisicao ' + newId + ' criada com sucesso.', data: { id: newId, flags: flags } };
    }, 'criarAquisicao');
  } catch (e) { return { success: false, message: e.message, data: null }; }
}

function consultarAquisicoes(filters) {
  try {
    filters = filters || {};
    var allRows = DAL.readAll(SHEET.AQUISICOES);
    var results = [];
    for (var i = 0; i < allRows.length; i++) {
      var row = allRows[i];
      if (filters.status && row[COL_AQUIS.STATUS_GERAL - 1] !== filters.status) continue;
      if (filters.tipoContratacao && row[COL_AQUIS.TIPO_CONTRATACAO - 1] !== filters.tipoContratacao) continue;
      if (filters.requisitante && String(row[COL_AQUIS.REQUISITANTE - 1]).indexOf(filters.requisitante) === -1) continue;
      if (filters.busca) {
        var termo = String(filters.busca).toLowerCase();
        var campos = [String(row[COL_AQUIS.ID - 1]), String(row[COL_AQUIS.DESCRICAO - 1]), String(row[COL_AQUIS.FORNECEDOR - 1])].join(' ').toLowerCase();
        if (campos.indexOf(termo) === -1) continue;
      }
      var dataAbertura = row[COL_AQUIS.DATA_ABERTURA - 1];
      var diasAberto = (dataAbertura instanceof Date) ? calcularDiasAberto(dataAbertura) : 0;
      results.push({
        id: row[COL_AQUIS.ID - 1], statusGeral: row[COL_AQUIS.STATUS_GERAL - 1],
        etapaAtual: row[COL_AQUIS.ETAPA_ATUAL - 1], descricao: row[COL_AQUIS.DESCRICAO - 1],
        tipoContratacao: row[COL_AQUIS.TIPO_CONTRATACAO - 1], naturezaTerceiro: row[COL_AQUIS.NATUREZA_TERCEIRO - 1],
        naturezaContratacao: row[COL_AQUIS.NATUREZA_CONTRATACAO - 1], formaContratacao: row[COL_AQUIS.FORMA_CONTRATACAO - 1],
        valorEstimado: row[COL_AQUIS.VALOR_ESTIMADO - 1], fornecedor: row[COL_AQUIS.FORNECEDOR - 1],
        cnpjCpf: row[COL_AQUIS.CNPJ_CPF - 1], centroCusto: row[COL_AQUIS.CENTRO_CUSTO - 1],
        requisitante: row[COL_AQUIS.REQUISITANTE - 1],
        dataAbertura: dataAbertura instanceof Date ? formatDateBR(dataAbertura) : '',
        prazoPrevisto: row[COL_AQUIS.PRAZO_PREVISTO - 1] instanceof Date ? formatDateBR(row[COL_AQUIS.PRAZO_PREVISTO - 1]) : '',
        estrutura: row[COL_AQUIS.ESTRUTURA - 1], coletaPrecos: row[COL_AQUIS.COLETA_PRECOS - 1],
        proposta: row[COL_AQUIS.PROPOSTA - 1], credenciamento: row[COL_AQUIS.CREDENCIAMENTO - 1],
        compliance: row[COL_AQUIS.COMPLIANCE - 1], contrato: row[COL_AQUIS.CONTRATO - 1],
        observacoes: row[COL_AQUIS.OBSERVACOES - 1], diasAberto: diasAberto, alertas: row[COL_AQUIS.ALERTAS - 1]
      });
    }
    return { success: true, data: results, message: results.length + ' aquisicao(oes) encontrada(s).' };
  } catch (e) { return { success: false, data: [], message: 'Erro: ' + e.message }; }
}

function consultarAquisicaoPorId(id) {
  try {
    var result = consultarAquisicoes({ busca: id });
    var aq = null;
    for (var i = 0; i < result.data.length; i++) { if (result.data[i].id === id) { aq = result.data[i]; break; } }
    if (!aq) return { success: false, data: null, message: 'Aquisicao ' + id + ' nao encontrada.' };
    return { success: true, data: aq, message: 'Aquisicao encontrada.' };
  } catch (e) { return { success: false, data: null, message: 'Erro: ' + e.message }; }
}

function editarAquisicao(id, formData) {
  try {
    return withDocumentLock(function() {
      var aq = DAL.findRow(SHEET.AQUISICOES, COL_AQUIS.ID, id);
      if (!aq) return { success: false, message: 'Aquisicao ' + id + ' nao encontrada.' };
      var row = aq.data;
      var recalcFlags = false;
      if (formData.descricao !== undefined) row[COL_AQUIS.DESCRICAO - 1] = normalizeString(formData.descricao);
      if (formData.tipoContratacao !== undefined) { row[COL_AQUIS.TIPO_CONTRATACAO - 1] = formData.tipoContratacao; recalcFlags = true; }
      if (formData.naturezaTerceiro !== undefined) { row[COL_AQUIS.NATUREZA_TERCEIRO - 1] = formData.naturezaTerceiro; recalcFlags = true; }
      if (formData.naturezaContratacao !== undefined) { row[COL_AQUIS.NATUREZA_CONTRATACAO - 1] = formData.naturezaContratacao; recalcFlags = true; }
      if (formData.formaContratacao !== undefined) { row[COL_AQUIS.FORMA_CONTRATACAO - 1] = formData.formaContratacao; recalcFlags = true; }
      if (formData.valorEstimado !== undefined) {
        if (!isPositiveNumber(formData.valorEstimado)) return { success: false, message: 'Valor estimado deve ser um numero positivo.' };
        row[COL_AQUIS.VALOR_ESTIMADO - 1] = parseFloat(formData.valorEstimado); recalcFlags = true;
      }
      if (formData.fornecedor !== undefined) row[COL_AQUIS.FORNECEDOR - 1] = normalizeString(formData.fornecedor);
      if (formData.cnpjCpf !== undefined) row[COL_AQUIS.CNPJ_CPF - 1] = (formData.cnpjCpf || '').replace(/[^\d]/g, '');
      if (formData.centroCusto !== undefined) row[COL_AQUIS.CENTRO_CUSTO - 1] = normalizeString(formData.centroCusto);
      if (formData.requisitante !== undefined) row[COL_AQUIS.REQUISITANTE - 1] = normalizeString(formData.requisitante);
      if (formData.estrutura !== undefined) row[COL_AQUIS.ESTRUTURA - 1] = normalizeString(formData.estrutura);
      if (formData.observacoes !== undefined) row[COL_AQUIS.OBSERVACOES - 1] = normalizeString(formData.observacoes);
      if (recalcFlags) {
        var flags = calcularRequisitos({ tipoContratacao: row[COL_AQUIS.TIPO_CONTRATACAO - 1], naturezaTerceiro: row[COL_AQUIS.NATUREZA_TERCEIRO - 1], naturezaContratacao: row[COL_AQUIS.NATUREZA_CONTRATACAO - 1], formaContratacao: row[COL_AQUIS.FORMA_CONTRATACAO - 1], valorEstimado: row[COL_AQUIS.VALOR_ESTIMADO - 1] });
        setProcessFlags_(row, flags);
        aplicarRequisitosEtapas_(id, flags);
      }
      DAL.updateRow(SHEET.AQUISICOES, aq.rowIndex, row);
      logAction('EDITAR_AQUISICAO', 'Aquisicao ' + id + ' editada');
      return { success: true, message: 'Aquisicao ' + id + ' atualizada.' };
    }, 'editarAquisicao');
  } catch (e) { return { success: false, message: e.message }; }
}

function cancelarAquisicao(id, motivo) {
  try {
    return withDocumentLock(function() {
      var aq = DAL.findRow(SHEET.AQUISICOES, COL_AQUIS.ID, id);
      if (!aq) return { success: false, message: 'Aquisicao ' + id + ' nao encontrada.' };
      if (aq.data[COL_AQUIS.STATUS_GERAL - 1] === STATUS.CANCELADO) return { success: false, message: 'Ja cancelada.' };
      aq.data[COL_AQUIS.STATUS_GERAL - 1] = STATUS.CANCELADO;
      aq.data[COL_AQUIS.OBSERVACOES - 1] = (aq.data[COL_AQUIS.OBSERVACOES - 1] ? aq.data[COL_AQUIS.OBSERVACOES - 1] + ' | ' : '') + 'CANCELADO: ' + normalizeString(motivo || 'Sem motivo');
      DAL.updateRow(SHEET.AQUISICOES, aq.rowIndex, aq.data);
      logAction('CANCELAR_AQUISICAO', 'Aquisicao ' + id + ' cancelada');
      return { success: true, message: 'Aquisicao ' + id + ' cancelada.' };
    }, 'cancelarAquisicao');
  } catch (e) { return { success: false, message: e.message }; }
}

function suspenderAquisicao(id, motivo) {
  try {
    return withDocumentLock(function() {
      var aq = DAL.findRow(SHEET.AQUISICOES, COL_AQUIS.ID, id);
      if (!aq) return { success: false, message: 'Aquisicao ' + id + ' nao encontrada.' };
      if (aq.data[COL_AQUIS.STATUS_GERAL - 1] !== STATUS.EM_ANDAMENTO) return { success: false, message: 'Somente aquisicoes em andamento podem ser suspensas.' };
      aq.data[COL_AQUIS.STATUS_GERAL - 1] = STATUS.SUSPENSO;
      aq.data[COL_AQUIS.OBSERVACOES - 1] = (aq.data[COL_AQUIS.OBSERVACOES - 1] ? aq.data[COL_AQUIS.OBSERVACOES - 1] + ' | ' : '') + 'SUSPENSO: ' + normalizeString(motivo || 'Sem motivo');
      DAL.updateRow(SHEET.AQUISICOES, aq.rowIndex, aq.data);
      logAction('SUSPENDER_AQUISICAO', 'Aquisicao ' + id + ' suspensa');
      return { success: true, message: 'Aquisicao ' + id + ' suspensa.' };
    }, 'suspenderAquisicao');
  } catch (e) { return { success: false, message: e.message }; }
}

function reativarAquisicao(id) {
  try {
    return withDocumentLock(function() {
      var aq = DAL.findRow(SHEET.AQUISICOES, COL_AQUIS.ID, id);
      if (!aq) return { success: false, message: 'Aquisicao ' + id + ' nao encontrada.' };
      if (aq.data[COL_AQUIS.STATUS_GERAL - 1] !== STATUS.SUSPENSO) return { success: false, message: 'Somente suspensas podem ser reativadas.' };
      aq.data[COL_AQUIS.STATUS_GERAL - 1] = STATUS.EM_ANDAMENTO;
      aq.data[COL_AQUIS.OBSERVACOES - 1] = (aq.data[COL_AQUIS.OBSERVACOES - 1] ? aq.data[COL_AQUIS.OBSERVACOES - 1] + ' | ' : '') + 'REATIVADO em ' + formatDateBR(new Date());
      DAL.updateRow(SHEET.AQUISICOES, aq.rowIndex, aq.data);
      logAction('REATIVAR_AQUISICAO', 'Aquisicao ' + id + ' reativada');
      return { success: true, message: 'Aquisicao ' + id + ' reativada.' };
    }, 'reativarAquisicao');
  } catch (e) { return { success: false, message: e.message }; }
}

function deletarAquisicao(id) {
  try {
    return withDocumentLock(function() {
      var aq = DAL.findRow(SHEET.AQUISICOES, COL_AQUIS.ID, id);
      if (!aq) return { success: false, message: 'Aquisicao ' + id + ' nao encontrada.' };
      var etapas = DAL.readWhere(SHEET.ETAPAS, function(row) {
        return String(row[COL_ETAPA.ID_AQUISICAO - 1]) === id;
      });
      etapas.sort(function(a, b) { return b.rowIndex - a.rowIndex; });
      for (var i = 0; i < etapas.length; i++) { DAL.deleteRow(SHEET.ETAPAS, etapas[i].rowIndex); }
      DAL.deleteRow(SHEET.AQUISICOES, aq.rowIndex);
      logAction('DELETAR_AQUISICAO', 'Aquisicao ' + id + ' deletada permanentemente');
      return { success: true, message: 'Aquisicao ' + id + ' deletada com sucesso.' };
    }, 'deletarAquisicao');
  } catch (e) { return { success: false, message: e.message }; }
}

function apagarTodasAquisicoes(confirmado) {
  try {
    if (!confirmado) return { success: false, message: 'Operacao nao confirmada.' };
    return withDocumentLock(function() {
      DAL.clearData(SHEET.AQUISICOES);
      DAL.clearData(SHEET.ETAPAS);
      logAction('APAGAR_AQUISICOES', 'Todas as aquisicoes e etapas removidas');
      return { success: true, message: 'Todas as aquisicoes foram removidas com sucesso.' };
    }, 'apagarTodasAquisicoes');
  } catch (e) { return { success: false, message: 'Erro: ' + e.message }; }
}

function getAquisicaoParaEdicao(id) {
  try {
    var aq = DAL.findRow(SHEET.AQUISICOES, COL_AQUIS.ID, id);
    if (!aq) return { success: false, data: null, message: 'Aquisicao nao encontrada.' };
    var r = aq.data;
    return {
      success: true,
      data: {
        id: r[COL_AQUIS.ID - 1], descricao: r[COL_AQUIS.DESCRICAO - 1],
        tipoContratacao: r[COL_AQUIS.TIPO_CONTRATACAO - 1], naturezaTerceiro: r[COL_AQUIS.NATUREZA_TERCEIRO - 1],
        naturezaContratacao: r[COL_AQUIS.NATUREZA_CONTRATACAO - 1], formaContratacao: r[COL_AQUIS.FORMA_CONTRATACAO - 1],
        valorEstimado: r[COL_AQUIS.VALOR_ESTIMADO - 1], fornecedor: r[COL_AQUIS.FORNECEDOR - 1],
        cnpjCpf: r[COL_AQUIS.CNPJ_CPF - 1], centroCusto: r[COL_AQUIS.CENTRO_CUSTO - 1],
        requisitante: r[COL_AQUIS.REQUISITANTE - 1], estrutura: r[COL_AQUIS.ESTRUTURA - 1],
        observacoes: r[COL_AQUIS.OBSERVACOES - 1]
      },
      message: 'Aquisicao carregada.'
    };
  } catch (e) { return { success: false, data: null, message: 'Erro: ' + e.message }; }
}

function generateNextId_(allRows) {
  var year = new Date().getFullYear();
  var prefix = 'DINT-' + year + '-';
  var maxSeq = 0;
  for (var i = 0; i < allRows.length; i++) {
    var id = String(allRows[i][COL_AQUIS.ID - 1]);
    if (id.indexOf(prefix) === 0) {
      var seq = parseInt(id.substring(prefix.length), 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }
  var nextSeq = String(maxSeq + 1);
  while (nextSeq.length < 3) nextSeq = '0' + nextSeq;
  return prefix + nextSeq;
}

function getFormOptions() {
  return {
    tiposContratacao: TIPOS_CONTRATACAO,
    naturezasTerceiro: NATUREZAS_TERCEIRO,
    naturezasContratacao: NATUREZAS_CONTRATACAO,
    formasContratacao: FORMAS_CONTRATACAO
  };
}

function getFornecedoresParaSelect() {
  try {
    var allRows = DAL.readAll(SHEET.FORNECEDORES);
    var list = [];
    for (var i = 0; i < allRows.length; i++) {
      list.push({ cnpjCpf: String(allRows[i][COL_FORN.CNPJ_CPF - 1]), razaoSocial: String(allRows[i][COL_FORN.RAZAO_SOCIAL - 1]) });
    }
    return list;
  } catch (e) { return []; }
}
