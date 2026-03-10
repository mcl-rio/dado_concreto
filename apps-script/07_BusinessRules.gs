/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Motor de Regras Normativas
 * ============================================================
 */

function calcularRequisitos(params) {
  var valor = parseFloat(params.valorEstimado) || 0;
  var flags = { coletaPrecos: false, proposta: false, credenciamento: false, compliance: false, contrato: false };

  if (params.tipoContratacao === 'Compra Direta' && valor >= THRESHOLDS.COLETA_PRECOS_VALOR) flags.coletaPrecos = true;
  if (params.tipoContratacao === 'Licitacao') flags.coletaPrecos = true;
  if (params.formaContratacao === 'Contrato' || valor >= THRESHOLDS.PROPOSTA_VALOR) flags.proposta = true;
  if (params.naturezaTerceiro === 'Pessoa Juridica') flags.credenciamento = true;
  if (valor >= THRESHOLDS.COMPLIANCE_VALOR || params.naturezaContratacao === 'Obra') flags.compliance = true;
  if (params.formaContratacao === 'Contrato' || valor >= THRESHOLDS.CONTRATO_VALOR) flags.contrato = true;

  return flags;
}

function aplicarRequisitosEtapas_(aquisicaoId, flags) {
  var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
    return String(row[COL_ETAPA.ID_AQUISICAO - 1]) === aquisicaoId;
  });
  var flagNames = Object.keys(FLAG_TO_STAGE);
  for (var f = 0; f < flagNames.length; f++) {
    var flagName = flagNames[f];
    if (!flags[flagName]) {
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

function setProcessFlags_(row, flags) {
  row[COL_AQUIS.COLETA_PRECOS - 1] = flags.coletaPrecos ? 'Obrigatorio' : 'N/A';
  row[COL_AQUIS.PROPOSTA - 1] = flags.proposta ? 'Obrigatorio' : 'N/A';
  row[COL_AQUIS.CREDENCIAMENTO - 1] = flags.credenciamento ? 'Obrigatorio' : 'N/A';
  row[COL_AQUIS.COMPLIANCE - 1] = flags.compliance ? 'Obrigatorio' : 'N/A';
  row[COL_AQUIS.CONTRATO - 1] = flags.contrato ? 'Obrigatorio' : 'N/A';
  return row;
}

function descreverRequisitos(flags) {
  var nomes = { coletaPrecos: 'Coleta de Precos', proposta: 'Proposta Comercial', credenciamento: 'Credenciamento', compliance: 'Compliance/Due Diligence', contrato: 'Instrumento Contratual' };
  var obrigatorios = [];
  var flagNames = Object.keys(flags);
  for (var i = 0; i < flagNames.length; i++) {
    if (flags[flagNames[i]]) obrigatorios.push(nomes[flagNames[i]]);
  }
  return obrigatorios.length > 0 ? 'Obrigatorios: ' + obrigatorios.join(', ') : 'Nenhuma exigencia adicional';
}
