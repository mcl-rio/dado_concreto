/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Entry Point e Menu
 * ============================================================
 * onOpen, onInstall, menu customizado, setup da planilha
 * e funções de lançamento do sidebar.
 * ============================================================
 */

/**
 * Trigger simples — executado quando a planilha é aberta.
 * Cria o menu customizado.
 */
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Workflow ADM DINT 2.0')
    .addItem('Abrir Painel Principal', 'showSidebarMain')
    .addSeparator()
    .addSubMenu(ui.createMenu('Processos')
      .addItem('Novo Processo', 'showSidebarProcessoNovo')
      .addItem('Consultar Processos', 'showSidebarProcessoConsulta'))
    .addSubMenu(ui.createMenu('Fornecedores')
      .addItem('Novo Fornecedor', 'showSidebarFornecedorNovo')
      .addItem('Consultar Fornecedores', 'showSidebarFornecedorConsulta'))
    .addSubMenu(ui.createMenu('Dashboard')
      .addItem('Atualizar Dashboard', 'refreshDashboard'))
    .addSubMenu(ui.createMenu('Configuracao')
      .addItem('Parametros', 'showSidebarConfig')
      .addItem('Gerenciar Alertas', 'showSidebarAlertas')
      .addItem('Instalar Triggers', 'installTriggers')
      .addItem('Remover Triggers', 'removeTriggers'))
    .addToUi();
}

/**
 * Executado quando o add-on é instalado.
 */
function onInstall(e) {
  onOpen(e);
}

// ── Setup da Planilha ────────────────────────────────────────

/**
 * Cria todas as abas necessarias com headers.
 * Execute UMA VEZ ao configurar uma planilha nova.
 * Menu: Workflow ADM DINT 2.0 > Configuracao > Instalar Triggers
 * Ou execute manualmente no editor: setupSpreadsheet()
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.rename('Workflow ADM DINT 2.0');

  // ── Processos ──
  var shProcessos = getOrCreateSheet_(ss, SHEET.PROCESSOS);
  shProcessos.clear();
  shProcessos.getRange(1, 1, 1, 24).setValues([[
    'ID', 'Status Geral', 'Etapa Atual', 'Descricao',
    'Tipo Contratacao', 'Natureza Terceiro', 'Natureza Contratacao',
    'Forma Contratacao', 'Valor Estimado', 'Fornecedor', 'CNPJ/CPF',
    'Centro de Custo', 'Requisitante', 'Data Abertura', 'Prazo Previsto',
    'Estrutura', 'Coleta Precos', 'Proposta', 'Credenciamento',
    'Compliance', 'Contrato', 'Observacoes', 'Dias Aberto', 'Alertas'
  ]]);
  shProcessos.setFrozenRows(1);
  shProcessos.getRange(1, 1, 1, 24).setFontWeight('bold').setBackground('#d9e2f3');

  // ── Fornecedores ──
  var shFornecedores = getOrCreateSheet_(ss, SHEET.FORNECEDORES);
  shFornecedores.clear();
  shFornecedores.getRange(1, 1, 1, 12).setValues([[
    'CNPJ/CPF', 'Razao Social', 'Tipo', 'Status Cadastro',
    'Validade Cadastro', 'Status Credenciamento', 'Validade Credenciamento',
    'Contato', 'Email', 'Telefone', 'Dados Bancarios', 'Observacoes'
  ]]);
  shFornecedores.setFrozenRows(1);
  shFornecedores.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#d9e2f3');

  // ── Etapas ──
  var shEtapas = getOrCreateSheet_(ss, SHEET.ETAPAS);
  shEtapas.clear();
  shEtapas.getRange(1, 1, 1, 10).setValues([[
    'ID Processo', 'Num', 'Etapa', 'Responsavel', 'Status',
    'Data Inicio', 'Data Conclusao', 'Prazo Limite',
    'Documento Ref', 'Observacoes'
  ]]);
  shEtapas.setFrozenRows(1);
  shEtapas.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#d9e2f3');

  // ── Dashboard ──
  var shDashboard = getOrCreateSheet_(ss, SHEET.DASHBOARD);
  shDashboard.clear();
  shDashboard.getRange(1, 1).setValue('Workflow ADM DINT 2.0 — Dashboard');
  shDashboard.getRange(1, 1).setFontWeight('bold').setFontSize(14);

  // ── Log ──
  var shLog = getOrCreateSheet_(ss, SHEET.LOG);
  shLog.clear();
  shLog.getRange(1, 1, 1, 4).setValues([[
    'Data/Hora', 'Usuario', 'Acao', 'Detalhes'
  ]]);
  shLog.setFrozenRows(1);
  shLog.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#d9e2f3');

  // ── HOME ──
  var shHome = getOrCreateSheet_(ss, SHEET.HOME);
  shHome.clear();
  shHome.getRange(1, 1).setValue('Workflow ADM DINT 2.0');
  shHome.getRange(1, 1).setFontWeight('bold').setFontSize(16);
  shHome.getRange(2, 1).setValue('Use o menu acima ou o sidebar para navegar.');

  // Remover aba padrao "Sheet1" / "Planilha1" se existir
  var defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Planilha1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  // Ativar aba HOME
  shHome.activate();

  SpreadsheetApp.getUi().alert(
    'Planilha configurada com sucesso!\n\n'
    + 'Abas criadas: HOME, Processos, Fornecedores, Etapas, Dashboard, Log\n\n'
    + 'Recarregue a pagina para ver o menu.'
  );
}

/**
 * Retorna uma aba existente ou cria uma nova.
 * @param {Spreadsheet} ss
 * @param {string} name
 * @returns {Sheet}
 */
function getOrCreateSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

// ── Sidebar Launchers ───────────────────────────────────────

/**
 * Abre o sidebar principal (painel de navegação).
 */
function showSidebarMain() {
  var html = HtmlService.createTemplateFromFile('Sidebar_Main')
    .evaluate()
    .setTitle('Workflow ADM DINT 2.0')
    .setWidth(420);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Abre o sidebar focado em novo processo.
 */
function showSidebarProcessoNovo() {
  setUserState('SIDEBAR_PANEL', 'processos-novo');
  showSidebarMain();
}

/**
 * Abre o sidebar focado em consulta de processos.
 */
function showSidebarProcessoConsulta() {
  setUserState('SIDEBAR_PANEL', 'processos-consulta');
  showSidebarMain();
}

/**
 * Abre o sidebar focado em novo fornecedor.
 */
function showSidebarFornecedorNovo() {
  setUserState('SIDEBAR_PANEL', 'fornecedores-novo');
  showSidebarMain();
}

/**
 * Abre o sidebar focado em consulta de fornecedores.
 */
function showSidebarFornecedorConsulta() {
  setUserState('SIDEBAR_PANEL', 'fornecedores-consulta');
  showSidebarMain();
}

/**
 * Abre o sidebar focado em configuração.
 */
function showSidebarConfig() {
  setUserState('SIDEBAR_PANEL', 'config');
  showSidebarMain();
}

/**
 * Abre o sidebar focado em alertas.
 */
function showSidebarAlertas() {
  setUserState('SIDEBAR_PANEL', 'alertas');
  showSidebarMain();
}

// ── Funções de painel (retornam HTML para o sidebar SPA) ────

/**
 * Retorna o painel inicial do sidebar.
 * @returns {string}
 */
function getInitialPanel() {
  var panel = getUserState('SIDEBAR_PANEL') || 'home';
  // Limpar estado após leitura
  setUserState('SIDEBAR_PANEL', '');
  return panel;
}

/**
 * Retorna HTML do painel de processos.
 * @returns {string}
 */
function getPanelProcessos() {
  var template = HtmlService.createTemplateFromFile('Panel_Processos');
  return template.evaluate().getContent();
}

/**
 * Retorna HTML do painel de fornecedores.
 * @returns {string}
 */
function getPanelFornecedores() {
  var template = HtmlService.createTemplateFromFile('Panel_Fornecedores');
  return template.evaluate().getContent();
}

/**
 * Retorna HTML do painel de etapas.
 * @returns {string}
 */
function getPanelEtapas() {
  var template = HtmlService.createTemplateFromFile('Panel_Etapas');
  return template.evaluate().getContent();
}

/**
 * Retorna HTML do painel do dashboard.
 * @returns {string}
 */
function getPanelDashboard() {
  var template = HtmlService.createTemplateFromFile('Panel_Dashboard');
  return template.evaluate().getContent();
}

/**
 * Retorna HTML do painel de alertas.
 * @returns {string}
 */
function getPanelAlertas() {
  var template = HtmlService.createTemplateFromFile('Panel_Alertas');
  return template.evaluate().getContent();
}

/**
 * Retorna HTML do painel de configuração.
 * @returns {string}
 */
function getPanelConfig() {
  var template = HtmlService.createTemplateFromFile('Panel_Config');
  return template.evaluate().getContent();
}
