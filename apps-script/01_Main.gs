/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Entry Point e Menu
 * ============================================================
 * onOpen, onInstall, menu customizado e funções de
 * lançamento do sidebar.
 * ============================================================
 */

/**
 * Trigger simples — executado quando a planilha é aberta.
 * Cria o menu customizado.
 */
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Workflow DINT v2.0')
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

// ── Sidebar Launchers ───────────────────────────────────────

/**
 * Abre o sidebar principal (painel de navegação).
 */
function showSidebarMain() {
  var html = HtmlService.createTemplateFromFile('Sidebar_Main')
    .evaluate()
    .setTitle('Workflow DINT / FGV v2.0')
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
