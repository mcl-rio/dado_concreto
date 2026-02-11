/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Motor de Regras Normativas
 * ============================================================
 * Calcula quais exigências (flags) se aplicam a um processo
 * com base nos normativos:
 *   NP AC.03.004, NP AC.03.006, NP AC.03.002,
 *   NP AF.03.003, Portaria 24/2024
 *
 * Função pura (sem I/O). Thresholds configuráveis em 00_Config.gs.
 * ============================================================
 */

/**
 * Calcula os 5 flags de exigência com base nas classificações do processo.
 *
 * @param {Object} params
 * @param {string} params.tipoContratacao     - Ex: "Compra Direta", "Licitacao"
 * @param {string} params.naturezaTerceiro    - Ex: "Pessoa Juridica", "Pessoa Fisica"
 * @param {string} params.naturezaContratacao - Ex: "Servico", "Material", "Obra"
 * @param {string} params.formaContratacao    - Ex: "Contrato", "Ordem de Servico"
 * @param {number} params.valorEstimado       - Valor em BRL
 *
 * @returns {Object} {
 *   coletaPrecos: boolean,
 *   proposta: boolean,
 *   credenciamento: boolean,
 *   compliance: boolean,
 *   contrato: boolean
 * }
 */
function calcularRequisitos(params) {
  var valor = parseFloat(params.valorEstimado) || 0;

  var flags = {
    coletaPrecos:    false,
    proposta:        false,
    credenciamento:  false,
    compliance:      false,
    contrato:        false
  };

  // ── Regra: Coleta de Preços (NP AC.03.004) ───────────────
  // Obrigatória para Compra Direta com valor >= threshold
  // Sempre obrigatória para Licitação
  if (params.tipoContratacao === 'Compra Direta' && valor >= THRESHOLDS.COLETA_PRECOS_VALOR) {
    flags.coletaPrecos = true;
  }
  if (params.tipoContratacao === 'Licitacao') {
    flags.coletaPrecos = true;
  }

  // ── Regra: Proposta Comercial (NP AC.03.004) ─────────────
  // Obrigatória quando forma = Contrato ou valor >= threshold
  if (params.formaContratacao === 'Contrato' || valor >= THRESHOLDS.PROPOSTA_VALOR) {
    flags.proposta = true;
  }

  // ── Regra: Credenciamento (NP AC.03.006) ─────────────────
  // Obrigatório para Pessoa Jurídica
  if (params.naturezaTerceiro === 'Pessoa Juridica') {
    flags.credenciamento = true;
  }

  // ── Regra: Compliance / Due Diligence (NP AC.03.006) ─────
  // Obrigatório quando valor >= threshold ou natureza = Obra
  if (valor >= THRESHOLDS.COMPLIANCE_VALOR || params.naturezaContratacao === 'Obra') {
    flags.compliance = true;
  }

  // ── Regra: Instrumento Contratual (NP AF.03.003) ─────────
  // Obrigatório quando forma = Contrato ou valor >= threshold
  if (params.formaContratacao === 'Contrato') {
    flags.contrato = true;
  }
  if (valor >= THRESHOLDS.CONTRATO_VALOR) {
    flags.contrato = true;
  }

  return flags;
}

/**
 * Aplica os flags de requisitos nas linhas de Etapas de um processo.
 * Etapas não obrigatórias são marcadas como "N/A".
 * DEVE ser chamada dentro de withDocumentLock().
 *
 * @param {string} processoId
 * @param {Object} flags - Saída de calcularRequisitos()
 */
function aplicarRequisitosEtapas_(processoId, flags) {
  var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
    return String(row[COL_ETAPA.ID_PROCESSO - 1]) === processoId;
  });

  var flagNames = Object.keys(FLAG_TO_STAGE);
  for (var f = 0; f < flagNames.length; f++) {
    var flagName = flagNames[f];
    if (!flags[flagName]) {
      // Flag não aplicável → marcar etapas correspondentes como N/A
      var stageNums = FLAG_TO_STAGE[flagName];
      for (var s = 0; s < stageNums.length; s++) {
        var stageNum = stageNums[s];
        for (var r = 0; r < stageRows.length; r++) {
          if (stageRows[r].data[COL_ETAPA.NUM - 1] === stageNum) {
            stageRows[r].data[COL_ETAPA.STATUS - 1] = STATUS.NAO_APLICAVEL;
            DAL.updateRow(SHEET.ETAPAS, stageRows[r].rowIndex, stageRows[r].data);
            break;
          }
        }
      }
    }
  }
}

/**
 * Define os valores das 5 colunas de flags na linha do processo.
 * Modifica o array in-place e retorna.
 *
 * @param {Array<any>} processoRow - Array representando a linha do processo
 * @param {Object} flags - Saída de calcularRequisitos()
 * @returns {Array<any>} O mesmo array modificado
 */
function setProcessFlags_(processoRow, flags) {
  processoRow[COL_PROC.COLETA_PRECOS - 1]  = flags.coletaPrecos   ? 'Obrigatorio' : 'N/A';
  processoRow[COL_PROC.PROPOSTA - 1]        = flags.proposta       ? 'Obrigatorio' : 'N/A';
  processoRow[COL_PROC.CREDENCIAMENTO - 1]  = flags.credenciamento ? 'Obrigatorio' : 'N/A';
  processoRow[COL_PROC.COMPLIANCE - 1]      = flags.compliance     ? 'Obrigatorio' : 'N/A';
  processoRow[COL_PROC.CONTRATO - 1]        = flags.contrato       ? 'Obrigatorio' : 'N/A';
  return processoRow;
}

/**
 * Retorna descrição textual dos requisitos aplicáveis (para display).
 * @param {Object} flags
 * @returns {string}
 */
function descreverRequisitos(flags) {
  var nomes = {
    coletaPrecos:   'Coleta de Precos',
    proposta:       'Proposta Comercial',
    credenciamento: 'Credenciamento',
    compliance:     'Compliance/Due Diligence',
    contrato:       'Instrumento Contratual'
  };

  var obrigatorios = [];
  var flagNames = Object.keys(flags);
  for (var i = 0; i < flagNames.length; i++) {
    if (flags[flagNames[i]]) {
      obrigatorios.push(nomes[flagNames[i]]);
    }
  }

  return obrigatorios.length > 0
    ? 'Obrigatorios: ' + obrigatorios.join(', ')
    : 'Nenhuma exigencia adicional';
}
