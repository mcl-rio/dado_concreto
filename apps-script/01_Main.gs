/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Entry Point e Menu
 * ============================================================
 */

function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Workflow ADM DINT 2.0')
    .addItem('Abrir Painel Principal', 'showPainelPrincipal')
    .addSeparator()
    .addSubMenu(ui.createMenu('Aquisicoes')
      .addItem('Nova Aquisicao', 'showPainelAquisicaoNova')
      .addItem('Consultar Aquisicoes', 'showPainelAquisicaoConsulta'))
    .addSubMenu(ui.createMenu('Fornecedores')
      .addItem('Novo Fornecedor', 'showPainelFornecedorNovo')
      .addItem('Consultar Fornecedores', 'showPainelFornecedorConsulta'))
    .addSubMenu(ui.createMenu('Dashboard')
      .addItem('Atualizar Dashboard', 'refreshDashboard'))
    .addSubMenu(ui.createMenu('Configuracao')
      .addItem('Parametros', 'showPainelConfig')
      .addItem('Gerenciar Alertas', 'showPainelAlertas')
      .addItem('Instalar Triggers', 'installTriggers')
      .addItem('Remover Triggers', 'removeTriggers'))
    .addToUi();
}

function onInstall(e) { onOpen(e); }

function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename('Workflow ADM DINT 2.0');

  // Migrar aba antiga Processos para Aquisicoes
  var shOld = ss.getSheetByName('Processos');
  if (shOld && !ss.getSheetByName(SHEET.AQUISICOES)) {
    shOld.setName(SHEET.AQUISICOES);
  }

  var shAquisicoes = getOrCreateSheet_(ss, SHEET.AQUISICOES);
  shAquisicoes.clear();
  shAquisicoes.getRange(1, 1, 1, 24).setValues([[
    'ID', 'Status Geral', 'Etapa Atual', 'Descricao',
    'Tipo Contratacao', 'Natureza Terceiro', 'Natureza Contratacao',
    'Forma Contratacao', 'Valor Estimado', 'Fornecedor', 'CNPJ/CPF',
    'Centro de Custo', 'Requisitante', 'Data Abertura', 'Prazo Previsto',
    'Estrutura', 'Coleta Precos', 'Proposta', 'Credenciamento',
    'Compliance', 'Contrato', 'Observacoes', 'Dias Aberto', 'Alertas'
  ]]);
  shAquisicoes.setFrozenRows(1);
  shAquisicoes.getRange(1, 1, 1, 24).setFontWeight('bold').setBackground('#d9e2f3');

  var shFornecedores = getOrCreateSheet_(ss, SHEET.FORNECEDORES);
  shFornecedores.clear();
  shFornecedores.getRange(1, 1, 1, 12).setValues([[
    'CNPJ/CPF', 'Razao Social', 'Tipo', 'Status Cadastro',
    'Validade Cadastro', 'Status Credenciamento', 'Validade Credenciamento',
    'Contato', 'Email', 'Telefone', 'Dados Bancarios', 'Observacoes'
  ]]);
  shFornecedores.setFrozenRows(1);
  shFornecedores.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#d9e2f3');

  var shEtapas = getOrCreateSheet_(ss, SHEET.ETAPAS);
  shEtapas.clear();
  shEtapas.getRange(1, 1, 1, 10).setValues([[
    'ID Aquisicao', 'Num', 'Etapa', 'Responsavel', 'Status',
    'Data Inicio', 'Data Conclusao', 'Prazo Limite',
    'Documento Ref', 'Observacoes'
  ]]);
  shEtapas.setFrozenRows(1);
  shEtapas.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#d9e2f3');

  var shDashboard = getOrCreateSheet_(ss, SHEET.DASHBOARD);
  shDashboard.clear();
  shDashboard.getRange(1, 1).setValue('Workflow ADM DINT 2.0 — Dashboard');
  shDashboard.getRange(1, 1).setFontWeight('bold').setFontSize(14);

  var shLog = getOrCreateSheet_(ss, SHEET.LOG);
  shLog.clear();
  shLog.getRange(1, 1, 1, 4).setValues([['Data/Hora', 'Usuario', 'Acao', 'Detalhes']]);
  shLog.setFrozenRows(1);
  shLog.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#d9e2f3');

  var shHome = getOrCreateSheet_(ss, SHEET.HOME);
  shHome.clear();
  shHome.getRange(1, 1).setValue('Workflow ADM DINT 2.0');
  shHome.getRange(1, 1).setFontWeight('bold').setFontSize(16);
  shHome.getRange(2, 1).setValue('Use o menu acima ou o painel para navegar.');

  var defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Planilha1');
  if (defaultSheet && ss.getSheets().length > 1) ss.deleteSheet(defaultSheet);
  shHome.activate();

  SpreadsheetApp.getUi().alert(
    'Planilha configurada com sucesso!\n\nAbas criadas: HOME, Aquisicoes, Fornecedores, Etapas, Dashboard, Log\n\nRecarregue a pagina para ver o menu.'
  );
}

function apagarTodosDados(confirmado) {
  try {
    if (!confirmado) return { success: false, message: 'Operacao nao confirmada.' };
    return withDocumentLock(function() {
      var abas = [SHEET.AQUISICOES, SHEET.FORNECEDORES, SHEET.ETAPAS, SHEET.LOG];
      for (var i = 0; i < abas.length; i++) { DAL.clearData(abas[i]); }
      var shDashboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET.DASHBOARD);
      if (shDashboard) {
        shDashboard.clear();
        shDashboard.getRange(1, 1).setValue('Workflow ADM DINT 2.0 — Dashboard');
        shDashboard.getRange(1, 1).setFontWeight('bold').setFontSize(14);
      }
      logAction('APAGAR_DADOS', 'Todos os dados foram apagados pelo usuario');
      return { success: true, message: 'Todos os dados foram apagados com sucesso.' };
    }, 'apagarTodosDados');
  } catch (e) { return { success: false, message: 'Erro ao apagar dados: ' + e.message }; }
}

function getOrCreateSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

// ── Painel Principal (Modal Dialog em tela cheia) ────────────

function showPainelPrincipal() {
  var html = HtmlService.createTemplateFromFile('Sidebar_Main')
    .evaluate()
    .setTitle('Workflow ADM DINT 2.0')
    .setWidth(960)
    .setHeight(620);
  SpreadsheetApp.getUi().showModalDialog(html, 'Workflow ADM DINT 2.0');
}

function showPainelAquisicaoNova() {
  setUserState('SIDEBAR_PANEL', 'aquisicoes-novo');
  showPainelPrincipal();
}

function showPainelAquisicaoConsulta() {
  setUserState('SIDEBAR_PANEL', 'aquisicoes-consulta');
  showPainelPrincipal();
}

function showPainelFornecedorNovo() {
  setUserState('SIDEBAR_PANEL', 'fornecedores-novo');
  showPainelPrincipal();
}

function showPainelFornecedorConsulta() {
  setUserState('SIDEBAR_PANEL', 'fornecedores-consulta');
  showPainelPrincipal();
}

function showPainelConfig() {
  setUserState('SIDEBAR_PANEL', 'config');
  showPainelPrincipal();
}

function showPainelAlertas() {
  setUserState('SIDEBAR_PANEL', 'alertas');
  showPainelPrincipal();
}

function getInitialPanel() {
  var panel = getUserState('SIDEBAR_PANEL') || 'home';
  setUserState('SIDEBAR_PANEL', '');
  return panel;
}

function getPanelAquisicoes() {
  return HtmlService.createTemplateFromFile('Panel_Processos').evaluate().getContent();
}

function getPanelFornecedores() {
  return HtmlService.createTemplateFromFile('Panel_Fornecedores').evaluate().getContent();
}

function getPanelEtapas() {
  return HtmlService.createTemplateFromFile('Panel_Etapas').evaluate().getContent();
}

function getPanelDashboard() {
  return HtmlService.createTemplateFromFile('Panel_Dashboard').evaluate().getContent();
}

function getPanelAlertas() {
  return HtmlService.createTemplateFromFile('Panel_Alertas').evaluate().getContent();
}

function getPanelConfig() {
  return HtmlService.createTemplateFromFile('Panel_Config').evaluate().getContent();
}
