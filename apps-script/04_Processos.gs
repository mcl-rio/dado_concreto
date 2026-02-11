/**
 * ============================================================
 * WORKFLOW DINT 2.0 — Gestão de Processos
 * ============================================================
 * CRUD de processos de contratação, geração de ID sequencial,
 * criação automática de etapas e cálculo de flags de exigência.
 * ============================================================
 */

/**
 * Cria um novo processo de contratação.
 * Gera ID sequencial, calcula flags, cria 23 etapas.
 * LOCKED.
 *
 * @param {Object} formData
 * @param {string} formData.descricao
 * @param {string} formData.tipoContratacao
 * @param {string} formData.naturezaTerceiro
 * @param {string} formData.naturezaContratacao
 * @param {string} formData.formaContratacao
 * @param {number} formData.valorEstimado
 * @param {string} [formData.fornecedor]
 * @param {string} [formData.cnpjCpf]
 * @param {string} [formData.centroCusto]
 * @param {string} [formData.requisitante]
 * @param {number} [formData.prazoPrevisto] - dias
 * @param {string} [formData.estrutura]
 * @param {string} [formData.observacoes]
 * @returns {{success: boolean, message: string, data: Object|null}}
 */
function criarProcesso(formData) {
  try {
    return withDocumentLock(function() {
      // 1. Validar campos obrigatórios
      var validation = validateRequired(formData, [
        'descricao', 'tipoContratacao', 'naturezaTerceiro',
        'naturezaContratacao', 'formaContratacao', 'valorEstimado'
      ]);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Campos obrigatorios: ' + validation.missing.join(', '),
          data: null
        };
      }

      if (!isPositiveNumber(formData.valorEstimado)) {
        return { success: false, message: 'Valor estimado deve ser um numero positivo.', data: null };
      }

      // 2. Gerar ID sequencial
      var allProcessos = DAL.readAll(SHEET.PROCESSOS);
      var newId = generateNextId_(allProcessos);

      // 3. Calcular flags de exigência
      var flags = calcularRequisitos({
        tipoContratacao:     formData.tipoContratacao,
        naturezaTerceiro:    formData.naturezaTerceiro,
        naturezaContratacao: formData.naturezaContratacao,
        formaContratacao:    formData.formaContratacao,
        valorEstimado:       parseFloat(formData.valorEstimado)
      });

      // 4. Montar linha do processo
      var hoje = new Date();
      var prazoDias = parseInt(formData.prazoPrevisto, 10) || 30;
      var prazoPrevisto = new Date(hoje.getTime() + prazoDias * 24 * 60 * 60 * 1000);

      var newRow = new Array(24);
      newRow[COL_PROC.ID - 1]                   = newId;
      newRow[COL_PROC.STATUS_GERAL - 1]         = STATUS.EM_ANDAMENTO;
      newRow[COL_PROC.ETAPA_ATUAL - 1]          = '1. ' + STAGES[0].name;
      newRow[COL_PROC.DESCRICAO - 1]            = normalizeString(formData.descricao);
      newRow[COL_PROC.TIPO_CONTRATACAO - 1]     = formData.tipoContratacao;
      newRow[COL_PROC.NATUREZA_TERCEIRO - 1]    = formData.naturezaTerceiro;
      newRow[COL_PROC.NATUREZA_CONTRATACAO - 1] = formData.naturezaContratacao;
      newRow[COL_PROC.FORMA_CONTRATACAO - 1]    = formData.formaContratacao;
      newRow[COL_PROC.VALOR_ESTIMADO - 1]       = parseFloat(formData.valorEstimado);
      newRow[COL_PROC.FORNECEDOR - 1]           = normalizeString(formData.fornecedor || '');
      newRow[COL_PROC.CNPJ_CPF - 1]             = (formData.cnpjCpf || '').replace(/[^\d]/g, '');
      newRow[COL_PROC.CENTRO_CUSTO - 1]         = normalizeString(formData.centroCusto || '');
      newRow[COL_PROC.REQUISITANTE - 1]         = normalizeString(formData.requisitante || '');
      newRow[COL_PROC.DATA_ABERTURA - 1]        = hoje;
      newRow[COL_PROC.PRAZO_PREVISTO - 1]       = prazoPrevisto;
      newRow[COL_PROC.ESTRUTURA - 1]            = normalizeString(formData.estrutura || '');
      newRow[COL_PROC.OBSERVACOES - 1]          = normalizeString(formData.observacoes || '');
      newRow[COL_PROC.DIAS_ABERTO - 1]          = 0;
      newRow[COL_PROC.ALERTAS - 1]              = '';

      // Aplicar flags
      setProcessFlags_(newRow, flags);

      // 5. Gravar processo
      DAL.appendRow(SHEET.PROCESSOS, newRow);

      // 6. Criar 23 etapas
      criarEtapasParaProcesso_(newId);

      // 7. Aplicar flags nas etapas (marcar N/A)
      aplicarRequisitosEtapas_(newId, flags);

      // 8. Log
      logAction('CRIAR_PROCESSO', 'Processo ' + newId + ' criado - '
                + formData.descricao + ' | ' + descreverRequisitos(flags));

      return {
        success: true,
        message: 'Processo ' + newId + ' criado com sucesso.',
        data: { id: newId, flags: flags }
      };
    }, 'criarProcesso');
  } catch (e) {
    return { success: false, message: e.message, data: null };
  }
}

/**
 * Consulta processos com filtros opcionais.
 * Operação de leitura — SEM lock.
 *
 * @param {Object} [filters]
 * @param {string} [filters.status]           - Filtrar por status geral
 * @param {string} [filters.tipoContratacao]  - Filtrar por tipo
 * @param {string} [filters.requisitante]     - Filtrar por requisitante
 * @param {string} [filters.busca]            - Busca textual (ID, descrição, fornecedor)
 * @returns {{success: boolean, data: Array<Object>, message: string}}
 */
function consultarProcessos(filters) {
  try {
    filters = filters || {};
    var allRows = DAL.readAll(SHEET.PROCESSOS);
    var results = [];

    for (var i = 0; i < allRows.length; i++) {
      var row = allRows[i];

      // Aplicar filtros
      if (filters.status && row[COL_PROC.STATUS_GERAL - 1] !== filters.status) continue;
      if (filters.tipoContratacao && row[COL_PROC.TIPO_CONTRATACAO - 1] !== filters.tipoContratacao) continue;
      if (filters.requisitante && String(row[COL_PROC.REQUISITANTE - 1]).indexOf(filters.requisitante) === -1) continue;

      if (filters.busca) {
        var termo = String(filters.busca).toLowerCase();
        var campos = [
          String(row[COL_PROC.ID - 1]),
          String(row[COL_PROC.DESCRICAO - 1]),
          String(row[COL_PROC.FORNECEDOR - 1])
        ].join(' ').toLowerCase();
        if (campos.indexOf(termo) === -1) continue;
      }

      // Atualizar dias em aberto dinamicamente
      var dataAbertura = row[COL_PROC.DATA_ABERTURA - 1];
      var diasAberto = (dataAbertura instanceof Date) ? calcularDiasAberto(dataAbertura) : 0;

      results.push({
        id:                   row[COL_PROC.ID - 1],
        statusGeral:          row[COL_PROC.STATUS_GERAL - 1],
        etapaAtual:           row[COL_PROC.ETAPA_ATUAL - 1],
        descricao:            row[COL_PROC.DESCRICAO - 1],
        tipoContratacao:      row[COL_PROC.TIPO_CONTRATACAO - 1],
        naturezaTerceiro:     row[COL_PROC.NATUREZA_TERCEIRO - 1],
        naturezaContratacao:  row[COL_PROC.NATUREZA_CONTRATACAO - 1],
        formaContratacao:     row[COL_PROC.FORMA_CONTRATACAO - 1],
        valorEstimado:        row[COL_PROC.VALOR_ESTIMADO - 1],
        fornecedor:           row[COL_PROC.FORNECEDOR - 1],
        cnpjCpf:              row[COL_PROC.CNPJ_CPF - 1],
        centroCusto:          row[COL_PROC.CENTRO_CUSTO - 1],
        requisitante:         row[COL_PROC.REQUISITANTE - 1],
        dataAbertura:         dataAbertura instanceof Date ? formatDateBR(dataAbertura) : '',
        prazoPrevisto:        row[COL_PROC.PRAZO_PREVISTO - 1] instanceof Date
                                ? formatDateBR(row[COL_PROC.PRAZO_PREVISTO - 1]) : '',
        estrutura:            row[COL_PROC.ESTRUTURA - 1],
        coletaPrecos:         row[COL_PROC.COLETA_PRECOS - 1],
        proposta:             row[COL_PROC.PROPOSTA - 1],
        credenciamento:       row[COL_PROC.CREDENCIAMENTO - 1],
        compliance:           row[COL_PROC.COMPLIANCE - 1],
        contrato:             row[COL_PROC.CONTRATO - 1],
        observacoes:          row[COL_PROC.OBSERVACOES - 1],
        diasAberto:           diasAberto,
        alertas:              row[COL_PROC.ALERTAS - 1]
      });
    }

    return {
      success: true,
      data: results,
      message: results.length + ' processo(s) encontrado(s).'
    };
  } catch (e) {
    return { success: false, data: [], message: 'Erro ao consultar processos: ' + e.message };
  }
}

/**
 * Retorna um único processo por ID.
 * SEM lock.
 *
 * @param {string} id
 * @returns {{success: boolean, data: Object|null, message: string}}
 */
function consultarProcessoPorId(id) {
  try {
    var result = consultarProcessos({ busca: id });
    if (result.data.length === 0) {
      return { success: false, data: null, message: 'Processo ' + id + ' nao encontrado.' };
    }
    var proc = result.data.find(function(p) { return p.id === id; });
    if (!proc) {
      return { success: false, data: null, message: 'Processo ' + id + ' nao encontrado.' };
    }
    return { success: true, data: proc, message: 'Processo encontrado.' };
  } catch (e) {
    return { success: false, data: null, message: 'Erro: ' + e.message };
  }
}

/**
 * Edita campos de um processo existente.
 * Recalcula flags se campos de classificação forem alterados.
 * LOCKED.
 *
 * @param {string} id
 * @param {Object} formData - Campos a atualizar (mesmos nomes de criarProcesso)
 * @returns {{success: boolean, message: string}}
 */
function editarProcesso(id, formData) {
  try {
    return withDocumentLock(function() {
      var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, id);
      if (!proc) {
        return { success: false, message: 'Processo ' + id + ' nao encontrado.' };
      }

      var row = proc.data;
      var recalcFlags = false;

      // Atualizar campos fornecidos
      if (formData.descricao !== undefined) {
        row[COL_PROC.DESCRICAO - 1] = normalizeString(formData.descricao);
      }
      if (formData.tipoContratacao !== undefined) {
        row[COL_PROC.TIPO_CONTRATACAO - 1] = formData.tipoContratacao;
        recalcFlags = true;
      }
      if (formData.naturezaTerceiro !== undefined) {
        row[COL_PROC.NATUREZA_TERCEIRO - 1] = formData.naturezaTerceiro;
        recalcFlags = true;
      }
      if (formData.naturezaContratacao !== undefined) {
        row[COL_PROC.NATUREZA_CONTRATACAO - 1] = formData.naturezaContratacao;
        recalcFlags = true;
      }
      if (formData.formaContratacao !== undefined) {
        row[COL_PROC.FORMA_CONTRATACAO - 1] = formData.formaContratacao;
        recalcFlags = true;
      }
      if (formData.valorEstimado !== undefined) {
        if (!isPositiveNumber(formData.valorEstimado)) {
          return { success: false, message: 'Valor estimado deve ser um numero positivo.' };
        }
        row[COL_PROC.VALOR_ESTIMADO - 1] = parseFloat(formData.valorEstimado);
        recalcFlags = true;
      }
      if (formData.fornecedor !== undefined) {
        row[COL_PROC.FORNECEDOR - 1] = normalizeString(formData.fornecedor);
      }
      if (formData.cnpjCpf !== undefined) {
        row[COL_PROC.CNPJ_CPF - 1] = (formData.cnpjCpf || '').replace(/[^\d]/g, '');
      }
      if (formData.centroCusto !== undefined) {
        row[COL_PROC.CENTRO_CUSTO - 1] = normalizeString(formData.centroCusto);
      }
      if (formData.requisitante !== undefined) {
        row[COL_PROC.REQUISITANTE - 1] = normalizeString(formData.requisitante);
      }
      if (formData.estrutura !== undefined) {
        row[COL_PROC.ESTRUTURA - 1] = normalizeString(formData.estrutura);
      }
      if (formData.observacoes !== undefined) {
        row[COL_PROC.OBSERVACOES - 1] = normalizeString(formData.observacoes);
      }

      // Recalcular flags se necessário
      if (recalcFlags) {
        var flags = calcularRequisitos({
          tipoContratacao:     row[COL_PROC.TIPO_CONTRATACAO - 1],
          naturezaTerceiro:    row[COL_PROC.NATUREZA_TERCEIRO - 1],
          naturezaContratacao: row[COL_PROC.NATUREZA_CONTRATACAO - 1],
          formaContratacao:    row[COL_PROC.FORMA_CONTRATACAO - 1],
          valorEstimado:       row[COL_PROC.VALOR_ESTIMADO - 1]
        });
        setProcessFlags_(row, flags);
        aplicarRequisitosEtapas_(id, flags);
      }

      DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, row);
      logAction('EDITAR_PROCESSO', 'Processo ' + id + ' editado'
                + (recalcFlags ? ' (flags recalculados)' : ''));

      return { success: true, message: 'Processo ' + id + ' atualizado.' };
    }, 'editarProcesso');
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Cancela um processo com motivo.
 * LOCKED.
 *
 * @param {string} id
 * @param {string} motivo
 * @returns {{success: boolean, message: string}}
 */
function cancelarProcesso(id, motivo) {
  try {
    return withDocumentLock(function() {
      var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, id);
      if (!proc) {
        return { success: false, message: 'Processo ' + id + ' nao encontrado.' };
      }

      if (proc.data[COL_PROC.STATUS_GERAL - 1] === STATUS.CANCELADO) {
        return { success: false, message: 'Processo ja esta cancelado.' };
      }

      proc.data[COL_PROC.STATUS_GERAL - 1] = STATUS.CANCELADO;
      proc.data[COL_PROC.OBSERVACOES - 1]  =
        (proc.data[COL_PROC.OBSERVACOES - 1] ? proc.data[COL_PROC.OBSERVACOES - 1] + ' | ' : '')
        + 'CANCELADO: ' + normalizeString(motivo || 'Sem motivo');

      DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, proc.data);
      logAction('CANCELAR_PROCESSO', 'Processo ' + id + ' cancelado: ' + (motivo || 'Sem motivo'));

      return { success: true, message: 'Processo ' + id + ' cancelado.' };
    }, 'cancelarProcesso');
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Suspende um processo com motivo.
 * LOCKED.
 *
 * @param {string} id
 * @param {string} motivo
 * @returns {{success: boolean, message: string}}
 */
function suspenderProcesso(id, motivo) {
  try {
    return withDocumentLock(function() {
      var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, id);
      if (!proc) {
        return { success: false, message: 'Processo ' + id + ' nao encontrado.' };
      }

      var statusAtual = proc.data[COL_PROC.STATUS_GERAL - 1];
      if (statusAtual !== STATUS.EM_ANDAMENTO) {
        return { success: false, message: 'Somente processos em andamento podem ser suspensos.' };
      }

      proc.data[COL_PROC.STATUS_GERAL - 1] = STATUS.SUSPENSO;
      proc.data[COL_PROC.OBSERVACOES - 1]  =
        (proc.data[COL_PROC.OBSERVACOES - 1] ? proc.data[COL_PROC.OBSERVACOES - 1] + ' | ' : '')
        + 'SUSPENSO: ' + normalizeString(motivo || 'Sem motivo');

      DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, proc.data);
      logAction('SUSPENDER_PROCESSO', 'Processo ' + id + ' suspenso: ' + (motivo || 'Sem motivo'));

      return { success: true, message: 'Processo ' + id + ' suspenso.' };
    }, 'suspenderProcesso');
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Reativa um processo suspenso.
 * LOCKED.
 *
 * @param {string} id
 * @returns {{success: boolean, message: string}}
 */
function reativarProcesso(id) {
  try {
    return withDocumentLock(function() {
      var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, id);
      if (!proc) {
        return { success: false, message: 'Processo ' + id + ' nao encontrado.' };
      }

      if (proc.data[COL_PROC.STATUS_GERAL - 1] !== STATUS.SUSPENSO) {
        return { success: false, message: 'Somente processos suspensos podem ser reativados.' };
      }

      proc.data[COL_PROC.STATUS_GERAL - 1] = STATUS.EM_ANDAMENTO;
      proc.data[COL_PROC.OBSERVACOES - 1]  =
        (proc.data[COL_PROC.OBSERVACOES - 1] ? proc.data[COL_PROC.OBSERVACOES - 1] + ' | ' : '')
        + 'REATIVADO em ' + formatDateBR(new Date());

      DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, proc.data);
      logAction('REATIVAR_PROCESSO', 'Processo ' + id + ' reativado');

      return { success: true, message: 'Processo ' + id + ' reativado.' };
    }, 'reativarProcesso');
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Retorna dados do processo formatados para o formulário de edição.
 * SEM lock.
 *
 * @param {string} id
 * @returns {{success: boolean, data: Object|null, message: string}}
 */
function getProcessoParaEdicao(id) {
  try {
    var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, id);
    if (!proc) {
      return { success: false, data: null, message: 'Processo nao encontrado.' };
    }
    var r = proc.data;
    return {
      success: true,
      data: {
        id:                   r[COL_PROC.ID - 1],
        descricao:            r[COL_PROC.DESCRICAO - 1],
        tipoContratacao:      r[COL_PROC.TIPO_CONTRATACAO - 1],
        naturezaTerceiro:     r[COL_PROC.NATUREZA_TERCEIRO - 1],
        naturezaContratacao:  r[COL_PROC.NATUREZA_CONTRATACAO - 1],
        formaContratacao:     r[COL_PROC.FORMA_CONTRATACAO - 1],
        valorEstimado:        r[COL_PROC.VALOR_ESTIMADO - 1],
        fornecedor:           r[COL_PROC.FORNECEDOR - 1],
        cnpjCpf:              r[COL_PROC.CNPJ_CPF - 1],
        centroCusto:          r[COL_PROC.CENTRO_CUSTO - 1],
        requisitante:         r[COL_PROC.REQUISITANTE - 1],
        estrutura:            r[COL_PROC.ESTRUTURA - 1],
        observacoes:          r[COL_PROC.OBSERVACOES - 1]
      },
      message: 'Processo carregado.'
    };
  } catch (e) {
    return { success: false, data: null, message: 'Erro: ' + e.message };
  }
}

// ── Helpers internos ────────────────────────────────────────

/**
 * Gera o próximo ID sequencial: DINT-YYYY-NNN
 * DEVE ser chamada dentro de withDocumentLock().
 *
 * @param {Array<Array<any>>} allRows - Todas as linhas de Processos
 * @returns {string}
 */
function generateNextId_(allRows) {
  var year = new Date().getFullYear();
  var prefix = 'DINT-' + year + '-';
  var maxSeq = 0;

  for (var i = 0; i < allRows.length; i++) {
    var id = String(allRows[i][COL_PROC.ID - 1]);
    if (id.indexOf(prefix) === 0) {
      var seq = parseInt(id.substring(prefix.length), 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  var nextSeq = String(maxSeq + 1);
  while (nextSeq.length < 3) nextSeq = '0' + nextSeq;
  return prefix + nextSeq;
}

/**
 * Retorna listas de opções para formulários (dropdowns).
 * SEM lock.
 * @returns {Object}
 */
function getFormOptions() {
  return {
    tiposContratacao:      TIPOS_CONTRATACAO,
    naturezasTerceiro:     NATUREZAS_TERCEIRO,
    naturezasContratacao:  NATUREZAS_CONTRATACAO,
    formasContratacao:     FORMAS_CONTRATACAO
  };
}
