/**
 * ============================================================================================
 * WORKFLOW DINT / FGV v2.0 — ARQUIVO CONSOLIDADO (Single-File Deployment)
 * ============================================================================================
 *
 * Este arquivo contem TODO o codigo do sistema Workflow DINT v2.0 em um unico arquivo .gs,
 * incluindo templates HTML embutidos como strings.
 *
 * COMO INSTALAR:
 * 1. Abra a planilha Google Sheets de destino.
 * 2. Va em Extensoes > Apps Script.
 * 3. Apague todo o conteudo existente (Code.gs padrao).
 * 4. Cole o conteudo inteiro deste arquivo no editor.
 * 5. Salve (Ctrl+S).
 * 6. Recarregue a planilha — o menu "Workflow DINT v2.0" aparecera.
 * 7. Use o menu Configuracao > Instalar Triggers para ativar automacoes.
 *
 * PREREQUISITOS:
 * - A planilha deve conter as abas: HOME, Processos, Fornecedores, Etapas, Dashboard, Log
 * - Cada aba deve ter os cabecalhos corretos na linha 1.
 * - Runtime V8 deve estar habilitado (padrao desde 2020).
 *
 * ESTRUTURA DESTE ARQUIVO:
 * - Secao 0: HTML_TEMPLATES — Templates HTML embutidos como strings
 * - Secao 1: Funcoes auxiliares para templates embutidos (include, createTemplateFromEmbedded_)
 * - Secao 2: 00_Config — Configuracao central
 * - Secao 3: 11_Utils — Utilitarios (sem include original, substituido)
 * - Secao 4: 10_Log — Registro de auditoria
 * - Secao 5: 02_Lock — Controle de concorrencia
 * - Secao 6: 03_DataAccess — Camada de acesso a dados (DAL)
 * - Secao 7: 07_BusinessRules — Motor de regras normativas
 * - Secao 8: 06_Etapas — Gestao de etapas
 * - Secao 9: 04_Processos — Gestao de processos
 * - Secao 10: 05_Fornecedores — Gestao de fornecedores
 * - Secao 11: 08_Dashboard — Dashboard e KPIs
 * - Secao 12: 09_Alertas — Sistema de alertas
 * - Secao 13: 01_Main — Entry point, menu e sidebar launchers (modificado)
 *
 * NOTA: Os templates HTML estao embutidos usando template literals (backticks).
 * O runtime V8 do Google Apps Script suporta template literals nativamente.
 *
 * ============================================================================================
 * Gerado automaticamente — NAO edite as secoes HTML manualmente.
 * ============================================================================================
 */

// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 0: HTML_TEMPLATES — Templates HTML embutidos                     █
// ████████████████████████████████████████████████████████████████████████████
var HTML_TEMPLATES = {
  'Sidebar_CSS': `<style>
  /* ── Reset & Base ──────────────────────────────────── */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Google Sans', Roboto, Arial, sans-serif;
    font-size: 13px;
    color: #202124;
    background: #fff;
    line-height: 1.5;
  }

  /* ── Navigation Bar ────────────────────────────────── */
  .nav-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px;
    background: #1a73e8;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .nav-btn {
    flex: 1;
    min-width: 70px;
    padding: 6px 4px;
    border: none;
    border-radius: 4px;
    background: rgba(255,255,255,0.15);
    color: #fff;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    transition: background 0.2s;
  }
  .nav-btn:hover { background: rgba(255,255,255,0.3); }
  .nav-btn.active { background: #fff; color: #1a73e8; }

  /* ── Content Area ──────────────────────────────────── */
  #content-area { padding: 12px; }

  /* ── Cards & Panels ────────────────────────────────── */
  .card {
    background: #f8f9fa;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
  }
  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a73e8;
    margin-bottom: 8px;
  }

  /* ── KPI Cards ─────────────────────────────────────── */
  .kpi-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }
  .kpi-card {
    background: #e8f0fe;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
  }
  .kpi-value {
    font-size: 22px;
    font-weight: 700;
    color: #1a73e8;
  }
  .kpi-label {
    font-size: 11px;
    color: #5f6368;
    margin-top: 2px;
  }

  /* ── Forms ─────────────────────────────────────────── */
  .form-group {
    margin-bottom: 10px;
  }
  .form-group label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #5f6368;
    margin-bottom: 3px;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
    transition: border-color 0.2s;
  }
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26,115,232,0.1);
  }
  .form-group textarea { resize: vertical; min-height: 60px; }

  /* ── Buttons ───────────────────────────────────────── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .btn-primary {
    background: #1a73e8;
    color: #fff;
  }
  .btn-primary:hover { background: #1557b0; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .btn-secondary {
    background: #f1f3f4;
    color: #3c4043;
  }
  .btn-secondary:hover { background: #e8eaed; }
  .btn-danger {
    background: #ea4335;
    color: #fff;
  }
  .btn-danger:hover { background: #c5221f; }
  .btn-success {
    background: #34a853;
    color: #fff;
  }
  .btn-success:hover { background: #2d8e47; }
  .btn-sm { padding: 4px 10px; font-size: 11px; }
  .btn-block { width: 100%; }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-group {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  /* ── Tables ────────────────────────────────────────── */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 8px;
  }
  .data-table th {
    background: #f1f3f4;
    padding: 6px 8px;
    text-align: left;
    font-weight: 600;
    color: #5f6368;
    border-bottom: 2px solid #dadce0;
    white-space: nowrap;
  }
  .data-table td {
    padding: 6px 8px;
    border-bottom: 1px solid #f1f3f4;
  }
  .data-table tr:hover td { background: #f8f9fa; }
  .data-table .clickable { cursor: pointer; color: #1a73e8; }
  .data-table .clickable:hover { text-decoration: underline; }

  /* ── Status Badges ─────────────────────────────────── */
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }
  .badge-andamento { background: #e8f0fe; color: #1a73e8; }
  .badge-concluido { background: #e6f4ea; color: #137333; }
  .badge-cancelado { background: #fce8e6; color: #c5221f; }
  .badge-suspenso  { background: #fef7e0; color: #ea8600; }
  .badge-pendente  { background: #f1f3f4; color: #5f6368; }
  .badge-na        { background: #f1f3f4; color: #9aa0a6; }

  /* ── Timeline (Etapas) ─────────────────────────────── */
  .timeline { list-style: none; padding-left: 0; }
  .timeline-item {
    position: relative;
    padding: 8px 0 8px 24px;
    border-left: 2px solid #dadce0;
  }
  .timeline-item:last-child { border-left: 2px solid transparent; }
  .timeline-item::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 12px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #dadce0;
  }
  .timeline-item.active::before { background: #1a73e8; }
  .timeline-item.done::before   { background: #34a853; }
  .timeline-item.na::before     { background: #9aa0a6; }
  .timeline-item .tl-title { font-weight: 500; font-size: 12px; }
  .timeline-item .tl-meta  { font-size: 11px; color: #5f6368; }

  /* ── Loading Overlay ───────────────────────────────── */
  #loading-overlay {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255,255,255,0.7);
    z-index: 999;
    align-items: center;
    justify-content: center;
  }
  #loading-overlay.show { display: flex; }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid #dadce0;
    border-top-color: #1a73e8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Toast Notifications ───────────────────────────── */
  #toast-container {
    position: fixed;
    bottom: 12px; left: 12px; right: 12px;
    z-index: 1000;
  }
  .toast {
    padding: 10px 14px;
    border-radius: 8px;
    margin-top: 6px;
    font-size: 12px;
    animation: slideUp 0.3s ease;
  }
  .toast-success { background: #e6f4ea; color: #137333; border: 1px solid #ceead6; }
  .toast-error   { background: #fce8e6; color: #c5221f; border: 1px solid #f5c6cb; }
  .toast-warning { background: #fef7e0; color: #ea8600; border: 1px solid #feefc3; }
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }

  /* ── Alerts Panel ──────────────────────────────────── */
  .alert-item {
    padding: 8px;
    border-left: 3px solid #ea4335;
    background: #fce8e6;
    border-radius: 0 4px 4px 0;
    margin-bottom: 6px;
    font-size: 12px;
  }
  .alert-item.warning {
    border-left-color: #ea8600;
    background: #fef7e0;
  }

  /* ── Search Bar ────────────────────────────────────── */
  .search-bar {
    display: flex;
    gap: 6px;
    margin-bottom: 12px;
  }
  .search-bar input {
    flex: 1;
    padding: 8px;
    border: 1px solid #dadce0;
    border-radius: 4px;
    font-size: 13px;
  }

  /* ── Home Panel ────────────────────────────────────── */
  .home-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .home-card {
    background: #f8f9fa;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 16px 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .home-card:hover {
    border-color: #1a73e8;
    box-shadow: 0 2px 8px rgba(26,115,232,0.15);
  }
  .home-card .icon { font-size: 24px; margin-bottom: 6px; }
  .home-card .label { font-size: 12px; font-weight: 500; color: #3c4043; }

  /* ── Utility ───────────────────────────────────────── */
  .text-center { text-align: center; }
  .text-muted  { color: #5f6368; }
  .text-small  { font-size: 11px; }
  .mt-8  { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .mb-8  { margin-bottom: 8px; }
  .mb-12 { margin-bottom: 12px; }
  .hidden { display: none; }
</style>
`,

  'Sidebar_JS': `<script>
/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Client-Side JavaScript
 * ============================================================
 * Wrapper para google.script.run, navegação SPA,
 * loading states e toast notifications.
 * ============================================================
 */

// ── Server Call Wrapper ─────────────────────────────────────

/**
 * Chama uma função server-side com Promise semantics.
 * Exibe loading overlay e trata erros com toast.
 *
 * @param {string} functionName - Nome da função no servidor
 * @param {...*} args - Argumentos para a função
 * @returns {Promise<*>}
 */
function callServer(functionName) {
  var args = Array.prototype.slice.call(arguments, 1);
  showLoading();

  return new Promise(function(resolve, reject) {
    var runner = google.script.run
      .withSuccessHandler(function(result) {
        hideLoading();
        resolve(result);
      })
      .withFailureHandler(function(error) {
        hideLoading();
        var msg = error.message || error || 'Erro inesperado';
        // Auto-retry para erros de lock
        if (msg.indexOf('sistema esta ocupado') !== -1) {
          showToast('Sistema ocupado. Tentando novamente...', 'warning');
          setTimeout(function() {
            var retryArgs = [functionName].concat(args);
            callServerNoRetry.apply(null, retryArgs).then(resolve).catch(reject);
          }, 3000);
        } else {
          showToast(msg, 'error');
          reject(error);
        }
      });

    runner[functionName].apply(runner, args);
  });
}

/**
 * Versão sem auto-retry do callServer.
 */
function callServerNoRetry(functionName) {
  var args = Array.prototype.slice.call(arguments, 1);
  showLoading();

  return new Promise(function(resolve, reject) {
    var runner = google.script.run
      .withSuccessHandler(function(result) {
        hideLoading();
        resolve(result);
      })
      .withFailureHandler(function(error) {
        hideLoading();
        showToast(error.message || 'Erro inesperado', 'error');
        reject(error);
      });

    runner[functionName].apply(runner, args);
  });
}

// ── Navigation ──────────────────────────────────────────────

var currentPanel = 'home';

/**
 * Navega para um painel específico.
 * @param {string} panelName
 * @param {Object} [params] - Parâmetros opcionais para o painel
 */
function navigateTo(panelName, params) {
  currentPanel = panelName;

  // Atualizar botões ativos
  var btns = document.querySelectorAll('.nav-btn');
  btns.forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.panel === panelName);
  });

  var contentArea = document.getElementById('content-area');

  switch (panelName) {
    case 'home':
      renderHomePanel();
      break;
    case 'processos':
    case 'processos-consulta':
      loadPanel('getPanelProcessos', function() { initProcessosPanel('consulta'); });
      break;
    case 'processos-novo':
      loadPanel('getPanelProcessos', function() { initProcessosPanel('novo'); });
      break;
    case 'fornecedores':
    case 'fornecedores-consulta':
      loadPanel('getPanelFornecedores', function() { initFornecedoresPanel('consulta'); });
      break;
    case 'fornecedores-novo':
      loadPanel('getPanelFornecedores', function() { initFornecedoresPanel('novo'); });
      break;
    case 'etapas':
      loadPanel('getPanelEtapas', function() { initEtapasPanel(params); });
      break;
    case 'dashboard':
      loadPanel('getPanelDashboard', function() { initDashboardPanel(); });
      break;
    case 'alertas':
      loadPanel('getPanelAlertas', function() { initAlertasPanel(); });
      break;
    case 'config':
      loadPanel('getPanelConfig', function() { initConfigPanel(); });
      break;
    default:
      renderHomePanel();
  }
}

/**
 * Carrega HTML de um painel server-side e injeta no content area.
 * @param {string} serverFunction
 * @param {Function} [initCallback] - Chamado após injeção
 */
function loadPanel(serverFunction, initCallback) {
  callServer(serverFunction).then(function(html) {
    document.getElementById('content-area').innerHTML = html;
    if (initCallback) initCallback();
  }).catch(function() {
    document.getElementById('content-area').innerHTML =
      '<div class="card text-center"><p class="text-muted">Erro ao carregar painel.</p></div>';
  });
}

/**
 * Renderiza o painel Home (ícones de navegação).
 */
function renderHomePanel() {
  var html = '<div class="card">'
    + '<div class="card-title">Workflow DINT / FGV v2.0</div>'
    + '<p class="text-small text-muted mb-12">Controle de Contratacoes — Diretoria Internacional</p>'
    + '</div>'
    + '<div class="home-grid">'
    + '<div class="home-card" onclick="navigateTo(\\'processos\\')"><div class="icon">&#128203;</div><div class="label">Processos</div></div>'
    + '<div class="home-card" onclick="navigateTo(\\'fornecedores\\')"><div class="icon">&#127970;</div><div class="label">Fornecedores</div></div>'
    + '<div class="home-card" onclick="navigateTo(\\'dashboard\\')"><div class="icon">&#128202;</div><div class="label">Dashboard</div></div>'
    + '<div class="home-card" onclick="navigateTo(\\'alertas\\')"><div class="icon">&#128276;</div><div class="label">Alertas</div></div>'
    + '<div class="home-card" onclick="navigateTo(\\'config\\')"><div class="icon">&#9881;</div><div class="label">Configuracao</div></div>'
    + '</div>'
    + '<p class="text-small text-muted text-center mt-12">v2.0 — Powered by Google Apps Script</p>';

  document.getElementById('content-area').innerHTML = html;
}

// ── Loading Overlay ─────────────────────────────────────────

function showLoading() {
  var overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('show');
}

function hideLoading() {
  var overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('show');
}

// ── Toast Notifications ─────────────────────────────────────

/**
 * Exibe uma notificação toast.
 * @param {string} message
 * @param {string} type - 'success', 'error', 'warning'
 * @param {number} [duration=4000] - ms para auto-dismiss
 */
function showToast(message, type, duration) {
  type = type || 'success';
  duration = duration || 4000;

  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

// ── Form Helpers ────────────────────────────────────────────

/**
 * Coleta dados de um formulário por ID.
 * @param {string} formId
 * @returns {Object}
 */
function collectFormData(formId) {
  var form = document.getElementById(formId);
  if (!form) return {};

  var data = {};
  var inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(function(input) {
    if (input.name) {
      data[input.name] = input.value;
    }
  });
  return data;
}

/**
 * Preenche um formulário com dados.
 * @param {string} formId
 * @param {Object} data
 */
function fillFormData(formId, data) {
  var form = document.getElementById(formId);
  if (!form || !data) return;

  Object.keys(data).forEach(function(key) {
    var input = form.querySelector('[name="' + key + '"]');
    if (input) {
      input.value = data[key] || '';
    }
  });
}

/**
 * Reseta um formulário.
 * @param {string} formId
 */
function resetForm(formId) {
  var form = document.getElementById(formId);
  if (form) form.reset();
}

// ── Status Badge Helper ─────────────────────────────────────

/**
 * Retorna HTML de badge baseado no status.
 * @param {string} status
 * @returns {string}
 */
function statusBadge(status) {
  var cls = 'badge-pendente';
  switch (status) {
    case 'Em Andamento': cls = 'badge-andamento'; break;
    case 'Concluido':    cls = 'badge-concluido'; break;
    case 'Cancelado':    cls = 'badge-cancelado'; break;
    case 'Suspenso':     cls = 'badge-suspenso';  break;
    case 'N/A':          cls = 'badge-na';         break;
  }
  return '<span class="badge ' + cls + '">' + (status || 'Pendente') + '</span>';
}

// ── Initialize on Load ──────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se há painel pré-definido
  callServer('getInitialPanel').then(function(panel) {
    if (panel && panel !== 'home') {
      navigateTo(panel);
    } else {
      renderHomePanel();
    }
  }).catch(function() {
    renderHomePanel();
  });
});
</script>
`,

  'Sidebar_Main': `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <?!= include('Sidebar_CSS') ?>
</head>
<body>
  <!-- Navigation Bar -->
  <div class="nav-bar">
    <button class="nav-btn active" data-panel="home" onclick="navigateTo('home')">Home</button>
    <button class="nav-btn" data-panel="processos" onclick="navigateTo('processos')">Processos</button>
    <button class="nav-btn" data-panel="fornecedores" onclick="navigateTo('fornecedores')">Fornecedores</button>
    <button class="nav-btn" data-panel="dashboard" onclick="navigateTo('dashboard')">Dashboard</button>
    <button class="nav-btn" data-panel="alertas" onclick="navigateTo('alertas')">Alertas</button>
    <button class="nav-btn" data-panel="config" onclick="navigateTo('config')">Config</button>
  </div>

  <!-- Content Area (SPA) -->
  <div id="content-area">
    <div class="text-center mt-12">
      <div class="spinner" style="margin: 40px auto;"></div>
      <p class="text-muted text-small">Carregando...</p>
    </div>
  </div>

  <!-- Loading Overlay -->
  <div id="loading-overlay">
    <div class="spinner"></div>
  </div>

  <!-- Toast Container -->
  <div id="toast-container"></div>

  <?!= include('Sidebar_JS') ?>
</body>
</html>
`,

  'Dialog_Confirm': `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    body {
      font-family: 'Google Sans', Roboto, Arial, sans-serif;
      font-size: 13px;
      padding: 16px;
      color: #202124;
    }
    .dialog-message {
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-primary { background: #1a73e8; color: #fff; }
    .btn-primary:hover { background: #1557b0; }
    .btn-secondary { background: #f1f3f4; color: #3c4043; }
    .btn-secondary:hover { background: #e8eaed; }
    .btn-danger { background: #ea4335; color: #fff; }
    .btn-danger:hover { background: #c5221f; }
  </style>
</head>
<body>
  <div class="dialog-message" id="dialog-message"></div>
  <div class="dialog-actions">
    <button class="btn btn-secondary" onclick="google.script.host.close()">Cancelar</button>
    <button class="btn" id="dialog-confirm-btn" onclick="confirmar()">Confirmar</button>
  </div>

  <script>
    // Parâmetros passados via template
    var actionData = <?!= JSON.stringify(actionData || {}) ?>;

    document.getElementById('dialog-message').innerHTML = actionData.message || 'Deseja confirmar esta acao?';

    var confirmBtn = document.getElementById('dialog-confirm-btn');
    if (actionData.danger) {
      confirmBtn.className = 'btn btn-danger';
    } else {
      confirmBtn.className = 'btn btn-primary';
    }
    confirmBtn.textContent = actionData.confirmLabel || 'Confirmar';

    function confirmar() {
      if (actionData.serverFunction) {
        google.script.run
          .withSuccessHandler(function() { google.script.host.close(); })
          .withFailureHandler(function(e) { alert(e.message); })
          [actionData.serverFunction].apply(null, actionData.args || []);
      } else {
        google.script.host.close();
      }
    }
  </script>
</body>
</html>
`,

  'Panel_Processos': `<!-- Painel de Processos -->
<div id="processos-view-consulta">
  <div class="card">
    <div class="card-title">Processos de Contratacao</div>
    <div class="btn-group mb-8">
      <button class="btn btn-primary btn-sm" onclick="showProcessoForm()">Novo Processo</button>
    </div>
    <div class="search-bar">
      <input type="text" id="proc-search" placeholder="Buscar por ID, descricao ou fornecedor..." onkeyup="if(event.key==='Enter')buscarProcessos()">
      <button class="btn btn-secondary btn-sm" onclick="buscarProcessos()">Buscar</button>
    </div>
    <div class="form-group">
      <select id="proc-filter-status" onchange="buscarProcessos()" style="padding:6px;font-size:12px;">
        <option value="">Todos os Status</option>
        <option value="Em Andamento">Em Andamento</option>
        <option value="Concluido">Concluido</option>
        <option value="Cancelado">Cancelado</option>
        <option value="Suspenso">Suspenso</option>
      </select>
    </div>
  </div>
  <div id="proc-results"></div>
</div>

<div id="processos-view-form" class="hidden">
  <div class="card">
    <div class="card-title" id="proc-form-title">Novo Processo</div>
    <form id="proc-form">
      <input type="hidden" name="id" id="proc-form-id">
      <div class="form-group">
        <label>Descricao *</label>
        <textarea name="descricao" required></textarea>
      </div>
      <div class="form-group">
        <label>Tipo de Contratacao *</label>
        <select name="tipoContratacao" required id="proc-tipo"></select>
      </div>
      <div class="form-group">
        <label>Natureza do Terceiro *</label>
        <select name="naturezaTerceiro" required id="proc-nat-terceiro"></select>
      </div>
      <div class="form-group">
        <label>Natureza da Contratacao *</label>
        <select name="naturezaContratacao" required id="proc-nat-contratacao"></select>
      </div>
      <div class="form-group">
        <label>Forma de Contratacao *</label>
        <select name="formaContratacao" required id="proc-forma"></select>
      </div>

      <!-- Campos normativos (Resumo Normas Contratações Terceiros) -->
      <div style="border:1px solid #3949ab;border-radius:6px;padding:10px;margin:10px 0;background:#e8eaf6;">
        <div style="font-weight:600;color:#3949ab;font-size:13px;margin-bottom:8px;">Classificacao Normativa (Resumo Normas)</div>
        <div class="form-group">
          <label>Tipo de Servico *</label>
          <select name="tipoServico" required id="proc-tipo-servico" onchange="previewRequisitos()"></select>
        </div>
        <div class="form-group">
          <label>PAR *</label>
          <select name="par" required id="proc-par" onchange="previewRequisitos()">
            <option value="">Selecione...</option>
            <option value="Sem PAR">Sem PAR (contratacao propria FGV)</option>
            <option value="Com PAR">Com PAR (projeto com cliente)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Duracao do Contrato *</label>
          <select name="duracao" required id="proc-duracao" onchange="previewRequisitos()">
            <option value="">Selecione...</option>
            <option value="Imediata">Imediata (&lt; 90 dias)</option>
            <option value="Prolongada">Prolongada (>= 90 dias)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Valor Estimado (R$) *</label>
        <input type="number" name="valorEstimado" step="0.01" min="0.01" required onchange="previewRequisitos()">
      </div>

      <!-- Preview de requisitos normativos -->
      <div id="proc-normas-preview" class="hidden" style="border:1px solid #43a047;border-radius:6px;padding:10px;margin:10px 0;background:#e8f5e9;">
        <div style="font-weight:600;color:#2e7d32;font-size:12px;margin-bottom:6px;">Exigencias normativas (secao <span id="norma-secao">-</span>)</div>
        <div id="norma-obrigatorios" style="font-size:11px;color:#1b5e20;"></div>
        <div id="norma-dispensaveis" style="font-size:11px;color:#757575;margin-top:4px;"></div>
      </div>
      <div class="form-group">
        <label>Fornecedor</label>
        <input type="text" name="fornecedor">
      </div>
      <div class="form-group">
        <label>CNPJ/CPF</label>
        <input type="text" name="cnpjCpf">
      </div>
      <div class="form-group">
        <label>Centro de Custo</label>
        <input type="text" name="centroCusto">
      </div>
      <div class="form-group">
        <label>Requisitante</label>
        <input type="text" name="requisitante">
      </div>
      <div class="form-group">
        <label>Prazo (dias)</label>
        <input type="number" name="prazoPrevisto" value="30" min="1">
      </div>
      <div class="form-group">
        <label>Estrutura</label>
        <input type="text" name="estrutura">
      </div>
      <div class="form-group">
        <label>Observacoes</label>
        <textarea name="observacoes"></textarea>
      </div>
      <div class="btn-group">
        <button type="button" class="btn btn-primary" onclick="salvarProcesso()">Salvar</button>
        <button type="button" class="btn btn-secondary" onclick="hideProcessoForm()">Cancelar</button>
      </div>
    </form>
  </div>
</div>

<script>
var editingProcessoId = null;

function initProcessosPanel(mode) {
  // Carregar opções dos dropdowns (incluindo novos campos normativos)
  callServer('getFormOptions').then(function(opts) {
    populateSelect('proc-tipo', opts.tiposContratacao);
    populateSelect('proc-nat-terceiro', opts.naturezasTerceiro);
    populateSelect('proc-nat-contratacao', opts.naturezasContratacao);
    populateSelect('proc-forma', opts.formasContratacao);
    populateSelect('proc-tipo-servico', opts.tiposServico || []);
  });

  if (mode === 'novo') {
    showProcessoForm();
  } else {
    buscarProcessos();
  }
}

// Preview de requisitos normativos em tempo real
function previewRequisitos() {
  var tipoServico = document.querySelector('[name="tipoServico"]').value;
  var par = document.querySelector('[name="par"]').value;
  var duracao = document.querySelector('[name="duracao"]').value;
  var valor = parseFloat(document.querySelector('[name="valorEstimado"]').value) || 0;
  var previewDiv = document.getElementById('proc-normas-preview');

  if (!tipoServico || !par || !duracao || valor <= 0) {
    previewDiv.classList.add('hidden');
    return;
  }

  callServer('previewRequisitosNormativos', {
    tipoServico: tipoServico, par: par, duracao: duracao, valorEstimado: valor
  }).then(function(result) {
    document.getElementById('norma-secao').textContent = result.secao || 'N/D';

    var obrigHtml = result.obrigatorios && result.obrigatorios.length > 0
      ? '<strong>OBRIGATORIOS:</strong> ' + result.obrigatorios.join(', ')
      : '<strong>Nenhuma exigencia obrigatoria</strong>';
    document.getElementById('norma-obrigatorios').innerHTML = obrigHtml;

    var dispHtml = result.dispensaveis && result.dispensaveis.length > 0
      ? '<em>Dispensaveis:</em> ' + result.dispensaveis.join(', ')
      : '';
    document.getElementById('norma-dispensaveis').innerHTML = dispHtml;

    if (!result.found) {
      previewDiv.style.borderColor = '#e65100';
      previewDiv.style.background = '#fff3e0';
      document.getElementById('norma-obrigatorios').innerHTML += '<br><span style="color:#e65100;">ATENCAO: Combinacao nao encontrada na matriz. Todas as exigencias ativadas por precaucao.</span>';
    } else {
      previewDiv.style.borderColor = '#43a047';
      previewDiv.style.background = '#e8f5e9';
    }

    previewDiv.classList.remove('hidden');
  });
}

function populateSelect(id, options) {
  var sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecione...</option>';
  options.forEach(function(opt) {
    sel.innerHTML += '<option value="' + opt + '">' + opt + '</option>';
  });
}

function buscarProcessos() {
  var busca = document.getElementById('proc-search').value;
  var status = document.getElementById('proc-filter-status').value;
  var filters = {};
  if (busca) filters.busca = busca;
  if (status) filters.status = status;

  callServer('consultarProcessos', filters).then(function(result) {
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    renderProcessosList(result.data);
  });
}

function renderProcessosList(processos) {
  var container = document.getElementById('proc-results');
  if (processos.length === 0) {
    container.innerHTML = '<div class="card text-center"><p class="text-muted">Nenhum processo encontrado.</p></div>';
    return;
  }

  var html = '<table class="data-table"><thead><tr>'
    + '<th>ID</th><th>Status</th><th>Etapa</th><th>Descricao</th><th>Dias</th><th>Acoes</th>'
    + '</tr></thead><tbody>';

  processos.forEach(function(p) {
    html += '<tr>'
      + '<td class="clickable" onclick="verProcesso(\\'' + p.id + '\\')">' + p.id + '</td>'
      + '<td>' + statusBadge(p.statusGeral) + '</td>'
      + '<td class="text-small">' + (p.etapaAtual || '-') + '</td>'
      + '<td class="text-small">' + (p.descricao || '').substring(0, 40) + '</td>'
      + '<td>' + p.diasAberto + '</td>'
      + '<td>'
      + '<button class="btn btn-sm btn-secondary" onclick="editarProc(\\'' + p.id + '\\')">Editar</button> '
      + '<button class="btn btn-sm btn-primary" onclick="verEtapas(\\'' + p.id + '\\')">Etapas</button>'
      + '</td></tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function showProcessoForm() {
  editingProcessoId = null;
  document.getElementById('proc-form-title').textContent = 'Novo Processo';
  document.getElementById('proc-form-id').value = '';
  resetForm('proc-form');
  document.getElementById('processos-view-consulta').classList.add('hidden');
  document.getElementById('processos-view-form').classList.remove('hidden');
}

function hideProcessoForm() {
  document.getElementById('processos-view-form').classList.add('hidden');
  document.getElementById('processos-view-consulta').classList.remove('hidden');
}

function salvarProcesso() {
  var data = collectFormData('proc-form');
  if (editingProcessoId) {
    callServer('editarProcesso', editingProcessoId, data).then(function(result) {
      showToast(result.message, result.success ? 'success' : 'error');
      if (result.success) { hideProcessoForm(); buscarProcessos(); }
    });
  } else {
    callServer('criarProcesso', data).then(function(result) {
      showToast(result.message, result.success ? 'success' : 'error');
      if (result.success) { hideProcessoForm(); buscarProcessos(); }
    });
  }
}

function editarProc(id) {
  callServer('getProcessoParaEdicao', id).then(function(result) {
    if (!result.success) { showToast(result.message, 'error'); return; }
    editingProcessoId = id;
    document.getElementById('proc-form-title').textContent = 'Editar Processo ' + id;
    document.getElementById('proc-form-id').value = id;
    fillFormData('proc-form', result.data);
    document.getElementById('processos-view-consulta').classList.add('hidden');
    document.getElementById('processos-view-form').classList.remove('hidden');
  });
}

function verProcesso(id) {
  callServer('consultarProcessoPorId', id).then(function(result) {
    if (!result.success) { showToast(result.message, 'error'); return; }
    var p = result.data;
    var html = '<div class="card">'
      + '<div class="card-title">' + p.id + ' - ' + p.descricao + '</div>'
      + '<p>' + statusBadge(p.statusGeral) + ' | Etapa: ' + (p.etapaAtual || '-') + '</p>'
      + '<table class="data-table mt-8">'
      + '<tr><td><strong>Tipo</strong></td><td>' + p.tipoContratacao + '</td></tr>'
      + '<tr><td><strong>Nat. Terceiro</strong></td><td>' + p.naturezaTerceiro + '</td></tr>'
      + '<tr><td><strong>Nat. Contratacao</strong></td><td>' + p.naturezaContratacao + '</td></tr>'
      + '<tr><td><strong>Forma</strong></td><td>' + p.formaContratacao + '</td></tr>'
      + '<tr><td><strong>Valor</strong></td><td>R$ ' + (p.valorEstimado || 0) + '</td></tr>'
      + '<tr><td><strong>Fornecedor</strong></td><td>' + (p.fornecedor || '-') + '</td></tr>'
      + '<tr><td><strong>Abertura</strong></td><td>' + (p.dataAbertura || '-') + '</td></tr>'
      + '<tr><td><strong>Prazo</strong></td><td>' + (p.prazoPrevisto || '-') + '</td></tr>'
      + '<tr><td><strong>Dias Aberto</strong></td><td>' + p.diasAberto + '</td></tr>'
      + '</table>'
      + '<div class="btn-group mt-8">'
      + '<button class="btn btn-primary btn-sm" onclick="verEtapas(\\'' + p.id + '\\')">Ver Etapas</button>'
      + '<button class="btn btn-secondary btn-sm" onclick="editarProc(\\'' + p.id + '\\')">Editar</button>'
      + '<button class="btn btn-secondary btn-sm" onclick="buscarProcessos();hideProcessoForm()">Voltar</button>'
      + '</div></div>';
    document.getElementById('proc-results').innerHTML = html;
  });
}

function verEtapas(id) {
  navigateTo('etapas', { processoId: id });
}
</script>
`,

  'Panel_Fornecedores': `<!-- Painel de Fornecedores -->
<div id="forn-view-consulta">
  <div class="card">
    <div class="card-title">Fornecedores</div>
    <div class="btn-group mb-8">
      <button class="btn btn-primary btn-sm" onclick="showFornecedorForm()">Novo Fornecedor</button>
    </div>
    <div class="search-bar">
      <input type="text" id="forn-search" placeholder="Buscar por razao social ou CNPJ/CPF..." onkeyup="if(event.key==='Enter')buscarFornecedores()">
      <button class="btn btn-secondary btn-sm" onclick="buscarFornecedores()">Buscar</button>
    </div>
  </div>
  <div id="forn-results"></div>
</div>

<div id="forn-view-form" class="hidden">
  <div class="card">
    <div class="card-title" id="forn-form-title">Novo Fornecedor</div>
    <form id="forn-form">
      <input type="hidden" name="originalCnpjCpf" id="forn-original-doc">
      <div class="form-group">
        <label>CNPJ/CPF *</label>
        <input type="text" name="cnpjCpf" required id="forn-doc">
      </div>
      <div class="form-group">
        <label>Razao Social *</label>
        <input type="text" name="razaoSocial" required>
      </div>
      <div class="form-group">
        <label>Tipo *</label>
        <select name="tipo" required>
          <option value="">Selecione...</option>
          <option value="Pessoa Juridica">Pessoa Juridica</option>
          <option value="Pessoa Fisica">Pessoa Fisica</option>
          <option value="Organismo Internacional">Organismo Internacional</option>
        </select>
      </div>
      <div class="form-group">
        <label>Contato</label>
        <input type="text" name="contato">
      </div>
      <div class="form-group">
        <label>E-mail</label>
        <input type="email" name="email">
      </div>
      <div class="form-group">
        <label>Telefone</label>
        <input type="text" name="telefone">
      </div>
      <div class="form-group">
        <label>Dados Bancarios</label>
        <textarea name="dadosBancarios"></textarea>
      </div>
      <div class="form-group">
        <label>Observacoes</label>
        <textarea name="observacoes"></textarea>
      </div>
      <div class="btn-group">
        <button type="button" class="btn btn-primary" onclick="salvarFornecedor()">Salvar</button>
        <button type="button" class="btn btn-secondary" onclick="hideFornecedorForm()">Cancelar</button>
      </div>
    </form>
  </div>
</div>

<script>
var editingFornecedor = null;

function initFornecedoresPanel(mode) {
  if (mode === 'novo') {
    showFornecedorForm();
  } else {
    buscarFornecedores();
  }
}

function buscarFornecedores() {
  var busca = document.getElementById('forn-search').value;
  var filters = {};
  if (busca) filters.busca = busca;

  callServer('consultarFornecedores', filters).then(function(result) {
    if (!result.success) { showToast(result.message, 'error'); return; }
    renderFornecedoresList(result.data);
  });
}

function renderFornecedoresList(fornecedores) {
  var container = document.getElementById('forn-results');
  if (fornecedores.length === 0) {
    container.innerHTML = '<div class="card text-center"><p class="text-muted">Nenhum fornecedor encontrado.</p></div>';
    return;
  }

  var html = '<table class="data-table"><thead><tr>'
    + '<th>CNPJ/CPF</th><th>Razao Social</th><th>Tipo</th><th>Cadastro</th><th>Credenciamento</th><th>Acoes</th>'
    + '</tr></thead><tbody>';

  fornecedores.forEach(function(f) {
    html += '<tr>'
      + '<td class="text-small">' + f.cnpjCpf + '</td>'
      + '<td>' + f.razaoSocial + '</td>'
      + '<td class="text-small">' + (f.tipo || '-') + '</td>'
      + '<td>' + statusBadge(f.statusCadastro || 'Pendente') + '</td>'
      + '<td>' + statusBadge(f.statusCredenciamento || 'Pendente') + '</td>'
      + '<td><button class="btn btn-sm btn-secondary" onclick="editarForn(\\'' + f.cnpjCpf + '\\')">Editar</button></td>'
      + '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function showFornecedorForm() {
  editingFornecedor = null;
  document.getElementById('forn-form-title').textContent = 'Novo Fornecedor';
  document.getElementById('forn-original-doc').value = '';
  document.getElementById('forn-doc').disabled = false;
  resetForm('forn-form');
  document.getElementById('forn-view-consulta').classList.add('hidden');
  document.getElementById('forn-view-form').classList.remove('hidden');
}

function hideFornecedorForm() {
  document.getElementById('forn-view-form').classList.add('hidden');
  document.getElementById('forn-view-consulta').classList.remove('hidden');
}

function salvarFornecedor() {
  var data = collectFormData('forn-form');
  if (editingFornecedor) {
    callServer('editarFornecedor', editingFornecedor, data).then(function(result) {
      showToast(result.message, result.success ? 'success' : 'error');
      if (result.success) { hideFornecedorForm(); buscarFornecedores(); }
    });
  } else {
    callServer('criarFornecedor', data).then(function(result) {
      showToast(result.message, result.success ? 'success' : 'error');
      if (result.success) { hideFornecedorForm(); buscarFornecedores(); }
    });
  }
}

function editarForn(cnpjCpf) {
  callServer('consultarFornecedorPorCnpj', cnpjCpf).then(function(result) {
    if (!result.success) { showToast(result.message, 'error'); return; }
    editingFornecedor = cnpjCpf;
    document.getElementById('forn-form-title').textContent = 'Editar Fornecedor';
    document.getElementById('forn-original-doc').value = cnpjCpf;
    document.getElementById('forn-doc').disabled = true;
    fillFormData('forn-form', result.data);
    document.getElementById('forn-view-consulta').classList.add('hidden');
    document.getElementById('forn-view-form').classList.remove('hidden');
  });
}
</script>
`,

  'Panel_Etapas': `<!-- Painel de Etapas (Timeline) -->
<div class="card">
  <div class="card-title" id="etapas-title">Etapas do Processo</div>
  <p class="text-small text-muted" id="etapas-subtitle"></p>
</div>
<div id="etapas-timeline"></div>
<div class="btn-group mt-8">
  <button class="btn btn-secondary btn-sm" onclick="navigateTo('processos')">Voltar para Processos</button>
</div>

<script>
var currentProcessoId = null;

function initEtapasPanel(params) {
  if (params && params.processoId) {
    currentProcessoId = params.processoId;
    document.getElementById('etapas-title').textContent = 'Etapas — ' + params.processoId;
    carregarEtapas(params.processoId);
  } else {
    document.getElementById('etapas-timeline').innerHTML =
      '<div class="card text-center"><p class="text-muted">Selecione um processo para ver as etapas.</p></div>';
  }
}

function carregarEtapas(processoId) {
  callServer('consultarEtapas', processoId).then(function(result) {
    if (!result.success) { showToast(result.message, 'error'); return; }
    renderTimeline(result.data);
  });
}

function renderTimeline(etapas) {
  var container = document.getElementById('etapas-timeline');

  if (etapas.length === 0) {
    container.innerHTML = '<div class="card text-center"><p class="text-muted">Nenhuma etapa encontrada.</p></div>';
    return;
  }

  var html = '<ul class="timeline">';

  etapas.forEach(function(e) {
    var itemClass = '';
    if (e.status === 'Em Andamento') itemClass = 'active';
    else if (e.status === 'Concluido') itemClass = 'done';
    else if (e.status === 'N/A') itemClass = 'na';

    var dataInfo = '';
    if (e.dataInicio) {
      var dt = e.dataInicio instanceof Date ? e.dataInicio : new Date(e.dataInicio);
      dataInfo += 'Inicio: ' + (dt.toLocaleDateString ? dt.toLocaleDateString('pt-BR') : e.dataInicio);
    }
    if (e.dataConclusao) {
      var dc = e.dataConclusao instanceof Date ? e.dataConclusao : new Date(e.dataConclusao);
      dataInfo += ' | Conclusao: ' + (dc.toLocaleDateString ? dc.toLocaleDateString('pt-BR') : e.dataConclusao);
    }
    if (e.prazoLimite) {
      var pl = e.prazoLimite instanceof Date ? e.prazoLimite : new Date(e.prazoLimite);
      dataInfo += ' | Prazo: ' + (pl.toLocaleDateString ? pl.toLocaleDateString('pt-BR') : e.prazoLimite);
    }

    // Badge normativo: etapas controladas pela matriz mostram obrigatório/dispensável
    var normaBadge = '';
    var etapasObrigatorias = [3,4,5,6,7,8,9,10]; // Etapas controladas por flags normativos
    if (etapasObrigatorias.indexOf(e.num) !== -1) {
      if (e.status === 'N/A') {
        normaBadge = ' <span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#e0e0e0;color:#616161;">Dispensavel</span>';
      } else {
        normaBadge = ' <span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#c8e6c9;color:#2e7d32;">Obrigatorio</span>';
      }
    }

    html += '<li class="timeline-item ' + itemClass + '">'
      + '<div class="tl-title">' + e.num + '. ' + e.etapa + normaBadge + '</div>'
      + '<div class="tl-meta">'
      + statusBadge(e.status) + ' | Resp: ' + e.responsavel
      + '</div>';

    if (dataInfo) {
      html += '<div class="tl-meta">' + dataInfo + '</div>';
    }

    if (e.documentoRef) {
      html += '<div class="tl-meta">Doc: ' + e.documentoRef + '</div>';
    }

    if (e.observacoes) {
      html += '<div class="tl-meta">Obs: ' + e.observacoes + '</div>';
    }

    // Botão de concluir etapa (apenas para etapas Em Andamento)
    if (e.status === 'Em Andamento') {
      html += '<div class="mt-8">'
        + '<button class="btn btn-success btn-sm" onclick="concluirEtapaUI(' + e.num + ')">Concluir Etapa</button> '
        + '<button class="btn btn-secondary btn-sm" onclick="editarEtapaUI(' + e.num + ')">Editar</button>'
        + '</div>';
    }

    html += '</li>';
  });

  html += '</ul>';
  container.innerHTML = html;
}

function concluirEtapaUI(etapaNum) {
  if (!currentProcessoId) return;

  callServer('concluirEtapa', currentProcessoId, etapaNum).then(function(result) {
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      carregarEtapas(currentProcessoId);
    }
  });
}

function editarEtapaUI(etapaNum) {
  if (!currentProcessoId) return;

  var prazo = prompt('Prazo Limite (dd/mm/aaaa):');
  var docRef = prompt('Documento Referencia:');
  var obs = prompt('Observacoes:');

  var updates = {};
  if (prazo) {
    var parts = prazo.split('/');
    if (parts.length === 3) {
      updates.prazoLimite = new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  if (docRef) updates.documentoRef = docRef;
  if (obs) updates.observacoes = obs;

  if (Object.keys(updates).length === 0) {
    showToast('Nenhuma alteracao informada.', 'warning');
    return;
  }

  callServer('atualizarEtapa', currentProcessoId, etapaNum, updates).then(function(result) {
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      carregarEtapas(currentProcessoId);
    }
  });
}
</script>
`,

  'Panel_Dashboard': `<!-- Painel do Dashboard -->
<div class="card">
  <div class="card-title">Dashboard</div>
  <button class="btn btn-secondary btn-sm" onclick="atualizarDashboard()">Atualizar Agora</button>
</div>

<div id="dashboard-kpis"></div>
<div id="dashboard-tables"></div>

<script>
function initDashboardPanel() {
  carregarDashboard();
}

function carregarDashboard() {
  callServer('getDashboardData').then(function(result) {
    if (!result.success) { showToast(result.message, 'error'); return; }
    renderDashboard(result.data);
  });
}

function renderDashboard(kpis) {
  // KPIs em cards
  var kpiHtml = '<div class="kpi-grid">'
    + kpiCard(kpis.totalProcessos, 'Total Processos')
    + kpiCard(kpis.emAndamento, 'Em Andamento')
    + kpiCard(kpis.concluidos, 'Concluidos')
    + kpiCard(kpis.cancelados, 'Cancelados')
    + kpiCard(kpis.suspensos, 'Suspensos')
    + kpiCard(kpis.mediadiasAberto, 'Media Dias Aberto')
    + '</div>';
  document.getElementById('dashboard-kpis').innerHTML = kpiHtml;

  // Tabelas
  var tablesHtml = '';

  // Por tipo de contratação
  var tipos = Object.keys(kpis.porTipo || {});
  if (tipos.length > 0) {
    tablesHtml += '<div class="card"><div class="card-title">Por Tipo de Contratacao</div>'
      + '<table class="data-table"><thead><tr><th>Tipo</th><th>Qtd</th></tr></thead><tbody>';
    tipos.forEach(function(t) {
      tablesHtml += '<tr><td>' + t + '</td><td>' + kpis.porTipo[t] + '</td></tr>';
    });
    tablesHtml += '</tbody></table></div>';
  }

  // Por etapa atual
  var etapas = Object.keys(kpis.porEtapaAtual || {});
  if (etapas.length > 0) {
    tablesHtml += '<div class="card"><div class="card-title">Por Etapa Atual (Em Andamento)</div>'
      + '<table class="data-table"><thead><tr><th>Etapa</th><th>Qtd</th></tr></thead><tbody>';
    etapas.forEach(function(e) {
      tablesHtml += '<tr><td class="text-small">' + e + '</td><td>' + kpis.porEtapaAtual[e] + '</td></tr>';
    });
    tablesHtml += '</tbody></table></div>';
  }

  // Volume mensal
  var meses = Object.keys(kpis.volumeMensal || {}).sort();
  if (meses.length > 0) {
    tablesHtml += '<div class="card"><div class="card-title">Volume Mensal</div>'
      + '<table class="data-table"><thead><tr><th>Mes/Ano</th><th>Qtd</th></tr></thead><tbody>';
    meses.forEach(function(m) {
      tablesHtml += '<tr><td>' + m + '</td><td>' + kpis.volumeMensal[m] + '</td></tr>';
    });
    tablesHtml += '</tbody></table></div>';
  }

  document.getElementById('dashboard-tables').innerHTML = tablesHtml;
}

function kpiCard(value, label) {
  return '<div class="kpi-card"><div class="kpi-value">' + value + '</div>'
    + '<div class="kpi-label">' + label + '</div></div>';
}

function atualizarDashboard() {
  callServer('refreshDashboard').then(function(result) {
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) carregarDashboard();
  });
}
</script>
`,

  'Panel_Alertas': `<!-- Painel de Alertas -->
<div class="card">
  <div class="card-title">Alertas Ativos</div>
  <button class="btn btn-secondary btn-sm" onclick="carregarAlertas()">Atualizar</button>
</div>
<div id="alertas-list"></div>

<div class="card mt-12">
  <div class="card-title">Configuracao de Alertas</div>
  <form id="alertas-config-form">
    <div class="form-group">
      <label>Destinatarios (emails separados por virgula)</label>
      <textarea name="recipients" id="alert-recipients" rows="2"></textarea>
    </div>
    <div class="form-group">
      <label>Dias antes do vencimento para alertar</label>
      <input type="number" name="overdueWarningDays" id="alert-warning-days" min="1" value="3">
    </div>
    <div class="form-group">
      <label>Dias sem movimentacao (processo parado)</label>
      <input type="number" name="staleDays" id="alert-stale-days" min="1" value="15">
    </div>
    <div class="form-group">
      <label>Dias antes do vencimento de credenciamento</label>
      <input type="number" name="credentialWarningDays" id="alert-cred-days" min="1" value="30">
    </div>
    <div class="btn-group">
      <button type="button" class="btn btn-primary btn-sm" onclick="salvarConfigAlerta()">Salvar Configuracao</button>
      <button type="button" class="btn btn-secondary btn-sm" onclick="executarAlertasManual()">Executar Alertas Agora</button>
    </div>
  </form>
</div>

<script>
function initAlertasPanel() {
  carregarAlertas();
  carregarConfigAlertas();
}

function carregarAlertas() {
  callServer('getAlertasAtivos').then(function(result) {
    if (!result.success) { showToast(result.message, 'error'); return; }
    renderAlertas(result.data);
  });
}

function renderAlertas(alertas) {
  var container = document.getElementById('alertas-list');
  if (alertas.length === 0) {
    container.innerHTML = '<div class="card text-center"><p class="text-muted text-small">Nenhum alerta ativo.</p></div>';
    return;
  }

  var html = '';
  alertas.forEach(function(a) {
    var isWarning = a.alerta.indexOf('PROXIMO') !== -1 || a.alerta.indexOf('VENCENDO') !== -1;
    html += '<div class="alert-item' + (isWarning ? ' warning' : '') + '">'
      + '<strong>' + a.processo + '</strong> — ' + (a.descricao || '') + '<br>'
      + '<span class="text-small">' + a.alerta + '</span>'
      + '</div>';
  });
  container.innerHTML = html;
}

function carregarConfigAlertas() {
  callServer('getConfigAlertas').then(function(config) {
    document.getElementById('alert-recipients').value = config.recipients || '';
    document.getElementById('alert-warning-days').value = config.thresholds.overdueWarningDays || 3;
    document.getElementById('alert-stale-days').value = config.thresholds.staleDays || 15;
    document.getElementById('alert-cred-days').value = config.thresholds.credentialWarningDays || 30;
  });
}

function salvarConfigAlerta() {
  var config = {
    recipients: document.getElementById('alert-recipients').value,
    thresholds: {
      overdueWarningDays: parseInt(document.getElementById('alert-warning-days').value, 10),
      staleDays: parseInt(document.getElementById('alert-stale-days').value, 10),
      credentialWarningDays: parseInt(document.getElementById('alert-cred-days').value, 10)
    }
  };

  callServer('salvarConfigAlertas', config).then(function(result) {
    showToast(result.message, result.success ? 'success' : 'error');
  });
}

function executarAlertasManual() {
  callServer('executarAlertasDiarios').then(function() {
    showToast('Alertas executados com sucesso.', 'success');
    carregarAlertas();
  }).catch(function() {
    showToast('Erro ao executar alertas.', 'error');
  });
}
</script>
`,

  'Panel_Config': `<!-- Painel de Configuracao -->
<div class="card">
  <div class="card-title">Configuracao do Sistema</div>
  <p class="text-small text-muted">Workflow DINT / FGV v2.0</p>
</div>

<div class="card">
  <div class="card-title">Normativos Implementados</div>
  <ul id="normativos-list" style="padding-left:16px;font-size:12px;"></ul>
</div>

<div class="card">
  <div class="card-title">Triggers Automaticos</div>
  <p class="text-small text-muted mb-8">
    Instale os triggers para ativar alertas diarios, relatorios semanais
    e atualizacao automatica do dashboard.
  </p>
  <div class="btn-group">
    <button class="btn btn-primary btn-sm" onclick="instalarTriggers()">Instalar Triggers</button>
    <button class="btn btn-danger btn-sm" onclick="removerTriggers()">Remover Triggers</button>
  </div>
</div>

<div class="card">
  <div class="card-title">Acoes do Sistema</div>
  <div class="btn-group" style="flex-wrap:wrap;">
    <button class="btn btn-secondary btn-sm" onclick="atualizarDashboardConfig()">Atualizar Dashboard</button>
    <button class="btn btn-secondary btn-sm" onclick="executarAlertasConfig()">Executar Alertas</button>
  </div>
</div>

<div class="card">
  <div class="card-title">Log de Acoes</div>
  <div class="form-group">
    <select id="log-filter-acao" style="padding:6px;font-size:12px;">
      <option value="">Todas as acoes</option>
      <option value="CRIAR_PROCESSO">Criar Processo</option>
      <option value="EDITAR_PROCESSO">Editar Processo</option>
      <option value="CANCELAR_PROCESSO">Cancelar Processo</option>
      <option value="CONCLUIR_ETAPA">Concluir Etapa</option>
      <option value="CRIAR_FORNECEDOR">Criar Fornecedor</option>
      <option value="ERROR">Erros</option>
      <option value="LOCK_FAILURE">Falhas de Lock</option>
    </select>
  </div>
  <button class="btn btn-secondary btn-sm mb-8" onclick="consultarLogConfig()">Consultar Log</button>
  <div id="log-results"></div>
</div>

<script>
function initConfigPanel() {
  // Listar normativos
  var normativos = ['NP AC.03.004', 'NP AC.03.006', 'NP AC.03.002', 'NP AF.03.003', 'Portaria 24/2024'];
  var list = document.getElementById('normativos-list');
  normativos.forEach(function(n) {
    list.innerHTML += '<li>' + n + '</li>';
  });
}

function instalarTriggers() {
  callServer('installTriggers').then(function() {
    showToast('Triggers instalados com sucesso.', 'success');
  });
}

function removerTriggers() {
  callServer('removeTriggers').then(function() {
    showToast('Triggers removidos.', 'success');
  });
}

function atualizarDashboardConfig() {
  callServer('refreshDashboard').then(function(result) {
    showToast(result.message, result.success ? 'success' : 'error');
  });
}

function executarAlertasConfig() {
  callServer('executarAlertasDiarios').then(function() {
    showToast('Alertas executados.', 'success');
  });
}

function consultarLogConfig() {
  var acao = document.getElementById('log-filter-acao').value;
  var filters = {};
  if (acao) filters.acao = acao;
  filters.limite = 50;

  callServer('consultarLog', filters).then(function(result) {
    if (!result.success) { showToast(result.message, 'error'); return; }
    renderLog(result.data);
  });
}

function renderLog(entries) {
  var container = document.getElementById('log-results');
  if (entries.length === 0) {
    container.innerHTML = '<p class="text-muted text-small">Nenhum registro encontrado.</p>';
    return;
  }

  var html = '<table class="data-table"><thead><tr>'
    + '<th>Data/Hora</th><th>Usuario</th><th>Acao</th><th>Detalhes</th>'
    + '</tr></thead><tbody>';

  entries.forEach(function(e) {
    html += '<tr>'
      + '<td class="text-small">' + e.dataHora + '</td>'
      + '<td class="text-small">' + e.usuario + '</td>'
      + '<td class="text-small">' + e.acao + '</td>'
      + '<td class="text-small">' + (e.detalhes || '').substring(0, 60) + '</td>'
      + '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}
</script>
`

};

// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 1: Funcoes auxiliares para templates embutidos                   █
// ████████████████████████████████████████████████████████████████████████████

/**
 * Retorna o conteudo de um template HTML embutido.
 * Substitui a funcao original que usava HtmlService.createHtmlOutputFromFile().
 * Uso em HTML: <?!= include('Sidebar_CSS') ?>
 * No modo consolidado, os includes ja sao resolvidos por createTemplateFromEmbedded_().
 * Esta funcao ainda e util se chamada diretamente do client-side via google.script.run.
 *
 * @param {string} filename - Nome do template (sem .html)
 * @returns {string} Conteudo HTML
 */
function include(filename) {
  return HTML_TEMPLATES[filename] || '';
}

/**
 * Cria um HtmlOutput a partir de um template HTML embutido.
 * Resolve todas as chamadas <?!= include('...') ?> substituindo pelo conteudo real.
 * Substitui HtmlService.createTemplateFromFile('X').evaluate().
 *
 * @param {string} name - Nome do template (sem .html)
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function createTemplateFromEmbedded_(name) {
  var content = HTML_TEMPLATES[name] || '';
  // Resolver chamadas include() embutidas nos templates
  content = content.replace(/<\?!=\s*include\(['"](\w+)['"]\)\s*\?>/g, function(match, fname) {
    return HTML_TEMPLATES[fname] || '';
  });
  return HtmlService.createHtmlOutput(content);
}

/**
 * Cria um HtmlOutput para o Dialog_Confirm com dados de acao injetados.
 * Substitui o uso de template data (<?!= JSON.stringify(actionData || {}) ?>)
 * por uma tag <script> que define a variavel actionData antes do codigo do dialog.
 *
 * @param {Object} actionData - Dados da acao (message, danger, confirmLabel, serverFunction, args)
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 */
function createConfirmDialog_(actionData) {
  var content = HTML_TEMPLATES['Dialog_Confirm'] || '';
  // Substituir o scriptlet de dados do template por dados reais via <script>
  // O template original tem: var actionData = <?!= JSON.stringify(actionData || {}) ?>;
  // Substituimos por: var actionData = {dados_reais};
  content = content.replace(
    /var actionData = <\?!=.*?\?>;/,
    'var actionData = ' + JSON.stringify(actionData || {}) + ';'
  );
  // Resolver outros includes se houver
  content = content.replace(/<\?!=\s*include\(['"](\w+)['"]\)\s*\?>/g, function(match, fname) {
    return HTML_TEMPLATES[fname] || '';
  });
  return HtmlService.createHtmlOutput(content);
}

// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 2: 00_Config ████████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Configuração Central
 * ============================================================
 * Constantes, nomes de abas, índices de colunas e enumerações.
 * Nenhuma lógica de negócio — apenas dados de referência.
 * ============================================================
 */

// ── Nomes das abas ──────────────────────────────────────────
var SHEET = {
  HOME:          'HOME',
  PROCESSOS:     'Processos',
  FORNECEDORES:  'Fornecedores',
  ETAPAS:        'Etapas',
  DASHBOARD:     'Dashboard',
  LOG:           'Log'
};

// ── Colunas da aba Processos (1-based) ──────────────────────
var COL_PROC = {
  ID:                     1,
  STATUS_GERAL:           2,
  ETAPA_ATUAL:            3,
  DESCRICAO:              4,
  TIPO_CONTRATACAO:       5,
  NATUREZA_TERCEIRO:      6,
  NATUREZA_CONTRATACAO:   7,
  FORMA_CONTRATACAO:      8,
  VALOR_ESTIMADO:         9,
  FORNECEDOR:            10,
  CNPJ_CPF:              11,
  CENTRO_CUSTO:          12,
  REQUISITANTE:          13,
  DATA_ABERTURA:         14,
  PRAZO_PREVISTO:        15,
  ESTRUTURA:             16,
  COLETA_PRECOS:         17,
  PROPOSTA:              18,
  CREDENCIAMENTO:        19,
  COMPLIANCE:            20,
  CONTRATO:              21,
  OBSERVACOES:           22,
  DIAS_ABERTO:           23,
  ALERTAS:               24,
  TIPO_SERVICO:          25,   // Tipo de serviço conforme Resumo Normas Contratações
  PAR:                   26,   // Sem PAR / Com PAR
  DURACAO_CONTRATO:      27,   // Imediata / Prolongada
  CADASTRAMENTO:         28    // Flag Cadastramento (Obrigatório/N/A)
};

// ── Colunas da aba Fornecedores (1-based) ───────────────────
var COL_FORN = {
  CNPJ_CPF:                1,
  RAZAO_SOCIAL:            2,
  TIPO:                    3,
  STATUS_CADASTRO:         4,
  VALIDADE_CADASTRO:       5,
  STATUS_CREDENCIAMENTO:   6,
  VALIDADE_CREDENCIAMENTO: 7,
  CONTATO:                 8,
  EMAIL:                   9,
  TELEFONE:               10,
  DADOS_BANCARIOS:        11,
  OBSERVACOES:            12
};

// ── Colunas da aba Etapas (1-based) ─────────────────────────
var COL_ETAPA = {
  ID_PROCESSO:     1,
  NUM:             2,
  ETAPA:           3,
  RESPONSAVEL:     4,
  STATUS:          5,
  DATA_INICIO:     6,
  DATA_CONCLUSAO:  7,
  PRAZO_LIMITE:    8,
  DOCUMENTO_REF:   9,
  OBSERVACOES:    10
};

// ── Colunas da aba Log (1-based) ────────────────────────────
var COL_LOG = {
  DATA_HORA:  1,
  USUARIO:    2,
  ACAO:       3,
  DETALHES:   4
};

// ── Status possíveis ────────────────────────────────────────
var STATUS = {
  EM_ANDAMENTO:   'Em Andamento',
  CONCLUIDO:      'Concluido',
  CANCELADO:      'Cancelado',
  SUSPENSO:       'Suspenso',
  PENDENTE:       'Pendente',
  NAO_APLICAVEL:  'N/A'
};

// ── Definição das 23 etapas do ciclo de contratação ─────────
var STAGES = [
  { num:  1, name: 'Identificacao da Necessidade',       responsible: 'DINT' },
  { num:  2, name: 'Verificacao Catalogo (INV)',          responsible: 'DINT' },
  { num:  3, name: 'Cadastro do Terceiro (Portal)',       responsible: 'DINT' },
  { num:  4, name: 'Credenciamento do Terceiro',          responsible: 'DINT' },
  { num:  5, name: 'Due Diligence (DCI)',                 responsible: 'DCI' },
  { num:  6, name: 'Coleta de Precos',                    responsible: 'DINT' },
  { num:  7, name: 'Mapa de Cotacao',                     responsible: 'DINT' },
  { num:  8, name: 'Proposta Comercial',                  responsible: 'DINT' },
  { num:  9, name: 'Instrumento Contratual',              responsible: 'DINT' },
  { num: 10, name: 'Assinatura Contrato (D4Sign)',        responsible: 'DINT' },
  { num: 11, name: 'Arquivamento (NDoc)',                 responsible: 'DINT' },
  { num: 12, name: 'Requisicao de Compra (RC)',           responsible: 'DINT' },
  { num: 13, name: 'Distribuicao (DO Compras)',           responsible: 'DO Compras' },
  { num: 14, name: 'Ordem de Compra (OC)',                responsible: 'DO Compras' },
  { num: 15, name: 'Aprovacao OC (AME)',                  responsible: 'DINT' },
  { num: 16, name: 'Envio ao Fornecedor',                 responsible: 'DO Compras' },
  { num: 17, name: 'Execucao (Entrega/Servico)',          responsible: 'Fornecedor' },
  { num: 18, name: 'Emissao NF-e',                        responsible: 'Fornecedor' },
  { num: 19, name: 'Verificacao NF-e (Contabilidade)',    responsible: 'Contabilidade' },
  { num: 20, name: 'Liberacao Pagamento (SACEPE)',        responsible: 'DINT' },
  { num: 21, name: 'Ateste via D4Sign',                   responsible: 'DINT' },
  { num: 22, name: 'Validacao Contas a Pagar',            responsible: 'Contas a Pagar' },
  { num: 23, name: 'Pagamento Efetuado',                  responsible: 'Contas a Pagar' }
];

// ── Mapeamento de flags de exigência para etapas ────────────
// Conforme Resumo de Normas de Contratações de Terceiros
var FLAG_TO_STAGE = {
  cadastramento:  [3],        // Etapa 3: Cadastro do Terceiro (Portal)
  credenciamento: [4],        // Etapa 4: Credenciamento do Terceiro
  compliance:     [5],        // Etapa 5: Due Diligence (DCI)
  mapaCotacao:    [6, 7],     // Etapa 6: Coleta de Preços + Etapa 7: Mapa de Cotação
  proposta:       [8],        // Etapa 8: Proposta Comercial
  contrato:       [9, 10]     // Etapa 9: Instrumento Contratual + Etapa 10: Assinatura
};

// ── Tipos e naturezas (enums de formulário) ─────────────────
var TIPOS_CONTRATACAO = [
  'Compra Direta',
  'Licitacao',
  'Dispensa de Licitacao',
  'Inexigibilidade'
];

var NATUREZAS_TERCEIRO = [
  'Pessoa Juridica',
  'Pessoa Fisica',
  'Organismo Internacional'
];

var NATUREZAS_CONTRATACAO = [
  'Servico',
  'Material',
  'Obra',
  'Consultoria',
  'Locacao'
];

var FORMAS_CONTRATACAO = [
  'Contrato',
  'Ordem de Servico',
  'Nota de Empenho',
  'Carta Acordo'
];

// ── Tipos de serviço conforme Resumo Normas Contratações ────
var TIPOS_SERVICO = [
  'Aquisicao de bens de PJ',
  'Servico tecnico por PF autonomo',
  'Servico tecnico por PJ',
  'Servico academico por PF autonomo',
  'Servico academico por PJ',
  'Servico administrativo por PF autonomo',
  'Servico administrativo por PJ'
];

// ── Chaves curtas para a matriz normativa ───────────────────
var TIPO_SERVICO_KEY = {
  'Aquisicao de bens de PJ':               'BENS_PJ',
  'Servico tecnico por PF autonomo':       'TEC_PF',
  'Servico tecnico por PJ':                'TEC_PJ',
  'Servico academico por PF autonomo':     'ACAD_PF',
  'Servico academico por PJ':              'ACAD_PJ',
  'Servico administrativo por PF autonomo':'ADM_PF',
  'Servico administrativo por PJ':         'ADM_PJ'
};

// ── PAR e Duração ───────────────────────────────────────────
var OPCOES_PAR = ['Sem PAR', 'Com PAR'];
var OPCOES_DURACAO = ['Imediata', 'Prolongada'];

// ── Configuração de Lock ────────────────────────────────────
var CONFIG_LOCK = {
  TIMEOUT_MS:     30000,   // 30s max por tentativa
  RETRY_COUNT:    3,       // até 3 tentativas
  RETRY_BASE_MS:  1000     // 1s backoff base
};

// ── Faixas de valor normativas ──────────────────────────────
// Conforme Resumo de Normas de Contratações de Terceiros
var FAIXAS_VALOR = [
  { id: 1, min: 0,      max: 4999.99,   label: 'Ate R$4.999,99' },
  { id: 2, min: 5000,    max: 24999.99,  label: 'R$5.000 a R$24.999,99' },
  { id: 3, min: 25000,   max: 99999.99,  label: 'R$25.000 a R$99.999,99' },
  { id: 4, min: 100000,  max: Infinity,  label: 'A partir de R$100.000' }
];

// ── Thresholds de regras normativas (legado, mantido p/ compatibilidade) ──
var THRESHOLDS = {
  COLETA_PRECOS_VALOR:   17600,    // R$ 17.600
  PROPOSTA_VALOR:        50000,    // R$ 50.000
  COMPLIANCE_VALOR:      50000,    // R$ 50.000
  CONTRATO_VALOR:        100000    // R$ 100.000
};

// ── Thresholds de alertas ───────────────────────────────────
var ALERT_DEFAULTS = {
  OVERDUE_WARNING_DAYS:     3,
  STALE_DAYS:              15,
  CREDENTIAL_WARNING_DAYS: 30
};

// ── Normativos implementados ────────────────────────────────
var NORMATIVES = [
  'NP AC.03.004',
  'NP AC.03.006',
  'NP AC.03.002',
  'NP AF.03.003',
  'Portaria 24/2024'
];

// ══════════════════════════════════════════════════════════════
// MATRIZ DE REQUISITOS NORMATIVOS
// Conforme "Resumo de Normas de Contratações de Terceiros"
// Chave: "PAR|DURACAO|FAIXA|TIPO_SERVICO_KEY"
// Valor: { cad, cred, mapa, prop, comp, contr, secao }
//   cad  = Cadastramento (Portal)
//   cred = Credenciamento
//   mapa = Mapa de Cotação
//   prop = Proposta Comercial
//   comp = Atendimento Compliance / Due Diligence (DCI)
//   contr= Instrumento Contratual
//   secao= Seção do Resumo Normativo
// ══════════════════════════════════════════════════════════════

var NORMAS_MATRIX = {};

// ── Função auxiliar para popular a matriz ────────────────────
function _m(par, dur, faixa, tipo, cad, cred, mapa, prop, comp, contr, secao) {
  NORMAS_MATRIX[par + '|' + dur + '|' + faixa + '|' + tipo] = {
    cad: cad, cred: cred, mapa: mapa, prop: prop, comp: comp, contr: contr,
    secao: secao
  };
}

// ┌─────────────────────────────────────────────────────────────┐
// │ 1. CONTRATAÇÃO PRÓPRIA DA FGV (SEM PAR)                    │
// └─────────────────────────────────────────────────────────────┘

// ── 1.1 Imediata, < 90 dias (sem PAR) ───────────────────────

// Seção 1.1.1 — Até R$4.999,99
_m('SEM_PAR','IMEDIATA',1,'BENS_PJ', true,false,false,false,false,false,'1.1.1');
_m('SEM_PAR','IMEDIATA',1,'TEC_PF',  true,false,false,false,false,false,'1.1.1');
_m('SEM_PAR','IMEDIATA',1,'TEC_PJ',  true,false,false,false,false,false,'1.1.1');
_m('SEM_PAR','IMEDIATA',1,'ACAD_PF', true,false,false,false,false,false,'1.1.1');
_m('SEM_PAR','IMEDIATA',1,'ACAD_PJ', true,false,false,false,false,false,'1.1.1');
_m('SEM_PAR','IMEDIATA',1,'ADM_PF',  true,false,false,false,false,false,'1.1.1');
_m('SEM_PAR','IMEDIATA',1,'ADM_PJ',  true,false,false,false,false,false,'1.1.1');

// Seção 1.1.2 — R$5.000 a R$24.999,99
_m('SEM_PAR','IMEDIATA',2,'BENS_PJ', true,false,true, false,false,false,'1.1.2');
_m('SEM_PAR','IMEDIATA',2,'TEC_PF',  true,false,true, false,false,false,'1.1.2');
_m('SEM_PAR','IMEDIATA',2,'TEC_PJ',  true,false,true, false,false,false,'1.1.2');
_m('SEM_PAR','IMEDIATA',2,'ACAD_PF', true,false,false,false,false,false,'1.1.2');
_m('SEM_PAR','IMEDIATA',2,'ACAD_PJ', true,false,false,false,false,false,'1.1.2');
_m('SEM_PAR','IMEDIATA',2,'ADM_PF',  true,false,true, false,false,false,'1.1.2');
_m('SEM_PAR','IMEDIATA',2,'ADM_PJ',  true,false,true, false,false,false,'1.1.2');

// Seção 1.1.3 — R$25.000 a R$99.999,99
_m('SEM_PAR','IMEDIATA',3,'BENS_PJ', true,false,true, true, true, false,'1.1.3');
_m('SEM_PAR','IMEDIATA',3,'TEC_PF',  true,true, true, true, true, false,'1.1.3');
_m('SEM_PAR','IMEDIATA',3,'TEC_PJ',  true,true, true, true, true, false,'1.1.3');
_m('SEM_PAR','IMEDIATA',3,'ACAD_PF', true,true, false,true, true, false,'1.1.3');
_m('SEM_PAR','IMEDIATA',3,'ACAD_PJ', true,true, false,true, true, false,'1.1.3');
_m('SEM_PAR','IMEDIATA',3,'ADM_PF',  true,false,true, true, true, false,'1.1.3');
_m('SEM_PAR','IMEDIATA',3,'ADM_PJ',  true,false,true, true, true, false,'1.1.3');

// Seção 1.1.4 — ≥ R$100.000
_m('SEM_PAR','IMEDIATA',4,'BENS_PJ', true,false,true, true, true, false,'1.1.4');
_m('SEM_PAR','IMEDIATA',4,'TEC_PF',  true,true, true, true, true, true, '1.1.4');
_m('SEM_PAR','IMEDIATA',4,'TEC_PJ',  true,true, true, true, true, true, '1.1.4');
_m('SEM_PAR','IMEDIATA',4,'ACAD_PF', true,true, false,true, true, true, '1.1.4');
_m('SEM_PAR','IMEDIATA',4,'ACAD_PJ', true,true, false,true, true, true, '1.1.4');
_m('SEM_PAR','IMEDIATA',4,'ADM_PF',  true,false,true, true, true, false,'1.1.4');
_m('SEM_PAR','IMEDIATA',4,'ADM_PJ',  true,false,true, true, true, false,'1.1.4');

// ── 1.2 Prolongada, ≥ 90 dias (sem PAR) ─────────────────────

// Seção 1.2.1 — Até R$4.999,99
_m('SEM_PAR','PROLONGADA',1,'BENS_PJ', true,false,false,false,false,false,'1.2.1');
_m('SEM_PAR','PROLONGADA',1,'TEC_PF',  true,false,false,false,true, false,'1.2.1');
_m('SEM_PAR','PROLONGADA',1,'TEC_PJ',  true,false,false,false,true, false,'1.2.1');
_m('SEM_PAR','PROLONGADA',1,'ACAD_PF', true,false,false,false,true, false,'1.2.1');
_m('SEM_PAR','PROLONGADA',1,'ACAD_PJ', true,false,false,false,true, false,'1.2.1');
_m('SEM_PAR','PROLONGADA',1,'ADM_PF',  true,false,false,false,true, false,'1.2.1');
_m('SEM_PAR','PROLONGADA',1,'ADM_PJ',  true,false,false,false,true, false,'1.2.1');

// Seção 1.2.2 — R$5.000 a R$24.999,99
_m('SEM_PAR','PROLONGADA',2,'BENS_PJ', true,false,true, false,false,false,'1.2.2');
_m('SEM_PAR','PROLONGADA',2,'TEC_PF',  true,false,true, false,true, false,'1.2.2');
_m('SEM_PAR','PROLONGADA',2,'TEC_PJ',  true,false,true, false,true, false,'1.2.2');
_m('SEM_PAR','PROLONGADA',2,'ACAD_PF', true,false,false,false,true, false,'1.2.2');
_m('SEM_PAR','PROLONGADA',2,'ACAD_PJ', true,false,false,false,true, false,'1.2.2');
_m('SEM_PAR','PROLONGADA',2,'ADM_PF',  true,false,true, false,true, false,'1.2.2');
_m('SEM_PAR','PROLONGADA',2,'ADM_PJ',  true,false,true, false,true, false,'1.2.2');

// Seção 1.2.3 — R$25.000 a R$99.999,99
_m('SEM_PAR','PROLONGADA',3,'BENS_PJ', true,true, true, true, true, false,'1.2.3');
_m('SEM_PAR','PROLONGADA',3,'TEC_PF',  true,false,true, true, true, false,'1.2.3');
_m('SEM_PAR','PROLONGADA',3,'TEC_PJ',  true,true, true, true, true, false,'1.2.3');
_m('SEM_PAR','PROLONGADA',3,'ACAD_PF', true,true, false,true, true, false,'1.2.3');
_m('SEM_PAR','PROLONGADA',3,'ACAD_PJ', true,true, false,true, true, false,'1.2.3');
_m('SEM_PAR','PROLONGADA',3,'ADM_PF',  true,false,true, true, true, false,'1.2.3');
_m('SEM_PAR','PROLONGADA',3,'ADM_PJ',  true,false,true, true, true, false,'1.2.3');

// Seção 1.2.4 — ≥ R$100.000
_m('SEM_PAR','PROLONGADA',4,'BENS_PJ', true,true, true, true, true, true, '1.2.4');
_m('SEM_PAR','PROLONGADA',4,'TEC_PF',  true,false,true, true, true, true, '1.2.4');
_m('SEM_PAR','PROLONGADA',4,'TEC_PJ',  true,true, true, true, true, true, '1.2.4');
_m('SEM_PAR','PROLONGADA',4,'ACAD_PF', true,true, false,true, true, true, '1.2.4');
_m('SEM_PAR','PROLONGADA',4,'ACAD_PJ', true,true, false,true, true, true, '1.2.4');
_m('SEM_PAR','PROLONGADA',4,'ADM_PF',  true,false,true, true, true, true, '1.2.4');
_m('SEM_PAR','PROLONGADA',4,'ADM_PJ',  true,true, true, true, true, true, '1.2.4');

// ┌─────────────────────────────────────────────────────────────┐
// │ 2. CONTRATAÇÃO EM PROJETOS COM CLIENTES (COM PAR)          │
// └─────────────────────────────────────────────────────────────┘

// ── 2.1 Imediata, < 90 dias (com PAR) ───────────────────────

// Seção 2.1.1 — Até R$4.999,99
_m('COM_PAR','IMEDIATA',1,'BENS_PJ', true,false,false,false,false,false,'2.1.1');
_m('COM_PAR','IMEDIATA',1,'TEC_PF',  true,false,false,false,false,true, '2.1.1');
_m('COM_PAR','IMEDIATA',1,'TEC_PJ',  true,false,false,false,false,true, '2.1.1');
_m('COM_PAR','IMEDIATA',1,'ACAD_PF', true,false,false,false,false,true, '2.1.1');
_m('COM_PAR','IMEDIATA',1,'ACAD_PJ', true,false,false,false,false,true, '2.1.1');
_m('COM_PAR','IMEDIATA',1,'ADM_PF',  true,false,false,false,false,false,'2.1.1');
_m('COM_PAR','IMEDIATA',1,'ADM_PJ',  true,false,false,false,false,false,'2.1.1');

// Seção 2.1.2 — R$5.000 a R$24.999,99
_m('COM_PAR','IMEDIATA',2,'BENS_PJ', true,false,true, true, false,false,'2.1.2');
_m('COM_PAR','IMEDIATA',2,'TEC_PF',  true,false,true, true, false,true, '2.1.2');
_m('COM_PAR','IMEDIATA',2,'TEC_PJ',  true,false,true, true, false,true, '2.1.2');
_m('COM_PAR','IMEDIATA',2,'ACAD_PF', true,false,false,false,false,true, '2.1.2');
_m('COM_PAR','IMEDIATA',2,'ACAD_PJ', true,false,false,false,false,true, '2.1.2');
_m('COM_PAR','IMEDIATA',2,'ADM_PF',  true,false,true, true, false,false,'2.1.2');
_m('COM_PAR','IMEDIATA',2,'ADM_PJ',  true,false,true, true, false,false,'2.1.2');

// Seção 2.1.3 — R$25.000 a R$99.999,99
_m('COM_PAR','IMEDIATA',3,'BENS_PJ', true,true, true, true, true, false,'2.1.3');
_m('COM_PAR','IMEDIATA',3,'TEC_PF',  true,true, true, true, true, true, '2.1.3');
_m('COM_PAR','IMEDIATA',3,'TEC_PJ',  true,true, true, true, true, true, '2.1.3');
_m('COM_PAR','IMEDIATA',3,'ACAD_PF', true,true, false,true, true, true, '2.1.3');
_m('COM_PAR','IMEDIATA',3,'ACAD_PJ', true,true, false,true, true, true, '2.1.3');
_m('COM_PAR','IMEDIATA',3,'ADM_PF',  true,false,true, true, true, false,'2.1.3');
_m('COM_PAR','IMEDIATA',3,'ADM_PJ',  true,false,true, true, true, false,'2.1.3');

// Seção 2.1.4 — ≥ R$100.000
_m('COM_PAR','IMEDIATA',4,'BENS_PJ', true,true, true, true, true, false,'2.1.4');
_m('COM_PAR','IMEDIATA',4,'TEC_PF',  true,true, true, true, true, true, '2.1.4');
_m('COM_PAR','IMEDIATA',4,'TEC_PJ',  true,true, true, true, true, true, '2.1.4');
_m('COM_PAR','IMEDIATA',4,'ACAD_PF', true,true, false,true, true, true, '2.1.4');
_m('COM_PAR','IMEDIATA',4,'ACAD_PJ', true,true, false,true, true, true, '2.1.4');
_m('COM_PAR','IMEDIATA',4,'ADM_PF',  true,false,true, true, true, true, '2.1.4');
_m('COM_PAR','IMEDIATA',4,'ADM_PJ',  true,true, true, true, true, true, '2.1.4');

// ── 2.2 Prolongada, ≥ 90 dias (com PAR) ─────────────────────

// Seção 2.2.1 — Até R$4.999,99
_m('COM_PAR','PROLONGADA',1,'BENS_PJ', true,false,false,false,false,false,'2.2.1');
_m('COM_PAR','PROLONGADA',1,'TEC_PF',  true,false,false,false,true, true, '2.2.1');
_m('COM_PAR','PROLONGADA',1,'TEC_PJ',  true,false,false,false,true, true, '2.2.1');
_m('COM_PAR','PROLONGADA',1,'ACAD_PF', true,false,false,false,true, true, '2.2.1');
_m('COM_PAR','PROLONGADA',1,'ACAD_PJ', true,false,false,false,true, true, '2.2.1');
_m('COM_PAR','PROLONGADA',1,'ADM_PF',  true,false,false,false,true, false,'2.2.1');
_m('COM_PAR','PROLONGADA',1,'ADM_PJ',  true,false,false,false,true, false,'2.2.1');

// Seção 2.2.2 — R$5.000 a R$24.999,99
_m('COM_PAR','PROLONGADA',2,'BENS_PJ', true,false,true, true, false,false,'2.2.2');
_m('COM_PAR','PROLONGADA',2,'TEC_PF',  true,false,true, true, true, true, '2.2.2');
_m('COM_PAR','PROLONGADA',2,'TEC_PJ',  true,false,true, true, true, true, '2.2.2');
_m('COM_PAR','PROLONGADA',2,'ACAD_PF', true,false,false,false,true, true, '2.2.2');
_m('COM_PAR','PROLONGADA',2,'ACAD_PJ', true,false,false,false,true, true, '2.2.2');
_m('COM_PAR','PROLONGADA',2,'ADM_PF',  true,false,true, true, true, false,'2.2.2');
_m('COM_PAR','PROLONGADA',2,'ADM_PJ',  true,false,true, true, true, false,'2.2.2');

// Seção 2.2.3 — R$25.000 a R$99.999,99
_m('COM_PAR','PROLONGADA',3,'BENS_PJ', true,true, true, true, true, false,'2.2.3');
_m('COM_PAR','PROLONGADA',3,'TEC_PF',  true,true, true, true, true, true, '2.2.3');
_m('COM_PAR','PROLONGADA',3,'TEC_PJ',  true,true, true, true, true, true, '2.2.3');
_m('COM_PAR','PROLONGADA',3,'ACAD_PF', true,true, false,true, true, true, '2.2.3');
_m('COM_PAR','PROLONGADA',3,'ACAD_PJ', true,true, false,true, true, true, '2.2.3');
_m('COM_PAR','PROLONGADA',3,'ADM_PF',  true,false,true, true, true, true, '2.2.3');
_m('COM_PAR','PROLONGADA',3,'ADM_PJ',  true,true, true, true, true, true, '2.2.3');

// Seção 2.2.4 — ≥ R$100.000
_m('COM_PAR','PROLONGADA',4,'BENS_PJ', true,true, true, true, true, true, '2.2.4');
_m('COM_PAR','PROLONGADA',4,'TEC_PF',  true,true, true, true, true, true, '2.2.4');
_m('COM_PAR','PROLONGADA',4,'TEC_PJ',  true,true, true, true, true, true, '2.2.4');
_m('COM_PAR','PROLONGADA',4,'ACAD_PF', true,true, false,true, true, true, '2.2.4');
_m('COM_PAR','PROLONGADA',4,'ACAD_PJ', true,true, false,true, true, true, '2.2.4');
_m('COM_PAR','PROLONGADA',4,'ADM_PF',  true,false,true, true, true, true, '2.2.4');
_m('COM_PAR','PROLONGADA',4,'ADM_PJ',  true,true, true, true, true, true, '2.2.4');

// ── Nomes legíveis dos requisitos ───────────────────────────
var NOMES_REQUISITOS = {
  cad:   'Cadastramento (Portal)',
  cred:  'Credenciamento',
  mapa:  'Mapa de Cotacao',
  prop:  'Proposta Comercial',
  comp:  'Atendimento Compliance / Due Diligence (DCI)',
  contr: 'Instrumento Contratual'
};

// ── Mapeamento de flag curto → flag do FLAG_TO_STAGE ────────
var FLAG_SHORT_TO_LONG = {
  cad:   'cadastramento',
  cred:  'credenciamento',
  mapa:  'mapaCotacao',
  prop:  'proposta',
  comp:  'compliance',
  contr: 'contrato'
};


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 3: 11_Utils █████████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Utilitários
 * ============================================================
 * Validações, formatação, include() para HTML,
 * helpers de PropertiesService.
 * ============================================================
 */

// ── HTML Template Include ───────────────────────────────────
// NOTA: A funcao include() original foi movida para a Secao 1
// (funcoes auxiliares de templates embutidos).

// ── Validação de CNPJ ───────────────────────────────────────

/**
 * Valida um CNPJ (14 dígitos) com cálculo dos dígitos verificadores.
 * @param {string} cnpj
 * @returns {boolean}
 */
function validateCNPJ(cnpj) {
  cnpj = String(cnpj).replace(/[^\d]/g, '');
  if (cnpj.length !== 14) return false;

  // Rejeita CNPJs com todos os dígitos iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  var tamanho = cnpj.length - 2;
  var numeros = cnpj.substring(0, tamanho);
  var digitos = cnpj.substring(tamanho);
  var soma = 0;
  var pos = tamanho - 7;

  for (var i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  var resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (var j = tamanho; j >= 1; j--) {
    soma += parseInt(numeros.charAt(tamanho - j), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1), 10);
}

// ── Validação de CPF ────────────────────────────────────────

/**
 * Valida um CPF (11 dígitos) com cálculo dos dígitos verificadores.
 * @param {string} cpf
 * @returns {boolean}
 */
function validateCPF(cpf) {
  cpf = String(cpf).replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  var soma = 0;
  for (var i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  var resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.charAt(9), 10)) return false;

  soma = 0;
  for (var j = 0; j < 10; j++) {
    soma += parseInt(cpf.charAt(j), 10) * (11 - j);
  }
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(cpf.charAt(10), 10);
}

/**
 * Valida CNPJ ou CPF automaticamente pelo tamanho.
 * @param {string} doc
 * @returns {boolean}
 */
function validateCNPJorCPF(doc) {
  var digits = String(doc).replace(/[^\d]/g, '');
  if (digits.length === 14) return validateCNPJ(digits);
  if (digits.length === 11) return validateCPF(digits);
  return false;
}

// ── Validação de campos obrigatórios ────────────────────────

/**
 * Verifica campos obrigatórios em um objeto de formulário.
 * @param {Object} formData
 * @param {Array<string>} requiredFields - nomes dos campos
 * @returns {{valid: boolean, missing: Array<string>}}
 */
function validateRequired(formData, requiredFields) {
  var missing = [];
  requiredFields.forEach(function(field) {
    var val = formData[field];
    if (val === undefined || val === null || String(val).trim() === '') {
      missing.push(field);
    }
  });
  return { valid: missing.length === 0, missing: missing };
}

/**
 * Verifica se um valor é um número positivo.
 * @param {*} value
 * @returns {boolean}
 */
function isPositiveNumber(value) {
  var num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

// ── Formatação ──────────────────────────────────────────────

/**
 * Formata data como dd/MM/yyyy.
 * @param {Date} date
 * @returns {string}
 */
function formatDateBR(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, 'America/Sao_Paulo', 'dd/MM/yyyy');
}

/**
 * Formata data e hora como dd/MM/yyyy HH:mm:ss.
 * @param {Date} date
 * @returns {string}
 */
function formatDateTimeBR(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  return Utilities.formatDate(date, 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');
}

/**
 * Formata valor como moeda brasileira: R$ X.XXX,XX
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  var num = parseFloat(value);
  if (isNaN(num)) return 'R$ 0,00';
  return 'R$ ' + num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Normaliza string: trim e colapsa espaços múltiplos.
 * @param {string} str
 * @returns {string}
 */
function normalizeString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

/**
 * Formata CNPJ com máscara: XX.XXX.XXX/XXXX-XX
 * @param {string} cnpj - apenas dígitos
 * @returns {string}
 */
function formatCNPJ(cnpj) {
  var d = String(cnpj).replace(/[^\d]/g, '');
  if (d.length !== 14) return cnpj;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF com máscara: XXX.XXX.XXX-XX
 * @param {string} cpf - apenas dígitos
 * @returns {string}
 */
function formatCPF(cpf) {
  var d = String(cpf).replace(/[^\d]/g, '');
  if (d.length !== 11) return cpf;
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

// ── PropertiesService Helpers ───────────────────────────────

/**
 * Armazena estado por usuário (UserProperties).
 * @param {string} key
 * @param {string} value
 */
function setUserState(key, value) {
  PropertiesService.getUserProperties().setProperty(key, value);
}

/**
 * Recupera estado por usuário.
 * @param {string} key
 * @returns {string|null}
 */
function getUserState(key) {
  return PropertiesService.getUserProperties().getProperty(key);
}

/**
 * Lê configuração do sistema (ScriptProperties).
 * @param {string} key
 * @returns {string|null}
 */
function getScriptConfig(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

/**
 * Grava configuração do sistema.
 * @param {string} key
 * @param {string} value
 */
function setScriptConfig(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}

/**
 * Calcula a diferença em dias entre duas datas (ignora hora).
 * @param {Date} dateA
 * @param {Date} dateB
 * @returns {number} diferença em dias (pode ser negativo)
 */
function diffDays(dateA, dateB) {
  var a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  var b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 4: 10_Log ███████████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Registro de Auditoria (Log)
 * ============================================================
 * Grava ações na aba Log com timestamp, usuário, ação e detalhes.
 * logAction() NUNCA lança exceção — falhas são silenciosas.
 * ============================================================
 */

/**
 * Registra uma ação na aba Log.
 *
 * @param {string} action  - Identificador da ação (ex: 'CRIAR_PROCESSO', 'ERROR')
 * @param {string} details - Texto livre com detalhes
 */
function logAction(action, details) {
  try {
    var user;
    try {
      user = Session.getActiveUser().getEmail();
    } catch (e) {
      user = 'Sistema';
    }
    if (!user) user = 'Sistema';

    var timestamp = new Date();
    var row = [
      formatDateTimeBR(timestamp),
      user,
      String(action),
      String(details || '')
    ];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET.LOG);
    if (sheet) {
      sheet.appendRow(row);
    }
  } catch (e) {
    // Log NUNCA lança exceção. Falha silenciosa com log no Stackdriver.
    console.error('logAction falhou: ' + e.message);
  }
}

/**
 * Consulta entradas do log com filtros opcionais.
 * Operação de leitura — sem lock.
 *
 * @param {Object} [filters] - Filtros opcionais
 * @param {string} [filters.acao]      - Filtrar por ação
 * @param {string} [filters.usuario]   - Filtrar por usuário
 * @param {Date}   [filters.dataInicio] - Data início
 * @param {Date}   [filters.dataFim]    - Data fim
 * @param {number} [filters.limite]     - Máximo de registros (default 100)
 * @returns {{success: boolean, data: Array<Object>, message: string}}
 */
function consultarLog(filters) {
  try {
    filters = filters || {};
    var limite = filters.limite || 100;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET.LOG);
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, data: [], message: 'Nenhum registro encontrado.' };
    }

    var allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
    var results = [];

    for (var i = allData.length - 1; i >= 0 && results.length < limite; i--) {
      var row = allData[i];
      var dataHora = row[0];
      var usuario = String(row[1]);
      var acao = String(row[2]);
      var detalhes = String(row[3]);

      // Aplicar filtros
      if (filters.acao && acao !== filters.acao) continue;
      if (filters.usuario && usuario.indexOf(filters.usuario) === -1) continue;

      if (filters.dataInicio || filters.dataFim) {
        var logDate;
        if (dataHora instanceof Date) {
          logDate = dataHora;
        } else {
          // Parse dd/MM/yyyy HH:mm:ss
          var parts = String(dataHora).split(' ');
          var dateParts = parts[0].split('/');
          logDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
        }

        if (filters.dataInicio && logDate < filters.dataInicio) continue;
        if (filters.dataFim && logDate > filters.dataFim) continue;
      }

      results.push({
        dataHora: dataHora,
        usuario: usuario,
        acao: acao,
        detalhes: detalhes
      });
    }

    return {
      success: true,
      data: results,
      message: results.length + ' registro(s) encontrado(s).'
    };
  } catch (e) {
    return { success: false, data: [], message: 'Erro ao consultar log: ' + e.message };
  }
}


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 5: 02_Lock ██████████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Controle de Concorrência
 * ============================================================
 * Wrapper para LockService.getDocumentLock() com retry
 * e exponential backoff. TODA operação de escrita no sistema
 * deve usar withDocumentLock().
 * ============================================================
 */

/**
 * Executa uma função callback sob lock de documento com retry e backoff.
 *
 * - Adquire LockService.getDocumentLock() com timeout configurável
 * - Até CONFIG_LOCK.RETRY_COUNT tentativas com exponential backoff
 * - Chama SpreadsheetApp.flush() antes de liberar o lock
 * - Loga falhas de lock para auditoria
 *
 * @param {Function} callback       - Função a executar enquanto segura o lock.
 *                                    Pode retornar qualquer valor.
 * @param {string}   operationName  - Nome da operação (para log e mensagem de erro).
 * @returns {*} O valor retornado pelo callback.
 * @throws {Error} Se o lock não puder ser adquirido após todas as tentativas,
 *                 ou se o callback lançar exceção.
 */
function withDocumentLock(callback, operationName) {
  var lock = LockService.getDocumentLock();
  var acquired = false;
  var lastError = null;

  for (var attempt = 0; attempt < CONFIG_LOCK.RETRY_COUNT; attempt++) {
    try {
      acquired = lock.tryLock(CONFIG_LOCK.TIMEOUT_MS);
      if (acquired) break;
    } catch (e) {
      lastError = e;
    }

    // Exponential backoff: 1s, 2s, 4s ...
    if (attempt < CONFIG_LOCK.RETRY_COUNT - 1) {
      var backoffMs = CONFIG_LOCK.RETRY_BASE_MS * Math.pow(2, attempt);
      Utilities.sleep(backoffMs);
    }
  }

  if (!acquired) {
    logAction('LOCK_FAILURE', operationName + ' - nao foi possivel adquirir lock apos '
              + CONFIG_LOCK.RETRY_COUNT + ' tentativa(s)'
              + (lastError ? ' | Erro: ' + lastError.message : ''));
    throw new Error('O sistema esta ocupado. Por favor, tente novamente em alguns segundos. ('
                    + operationName + ')');
  }

  try {
    var result = callback();
    // Garante que todas as escritas pendentes foram aplicadas ANTES de liberar o lock
    SpreadsheetApp.flush();
    return result;
  } catch (e) {
    logAction('ERROR', operationName + ': ' + e.message);
    throw e;
  } finally {
    lock.releaseLock();
  }
}


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 6: 03_DataAccess ████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Camada de Acesso a Dados (DAL)
 * ============================================================
 * Abstrai todas as interações com SpreadsheetApp.
 * NENHUM outro arquivo deve chamar getRange(), getValues()
 * ou setValues() diretamente.
 *
 * Princípios:
 * - Batch reads: getDataRange().getValues()
 * - Batch writes: setValues() em uma operação
 * - Cache de referência por invocação (GAS é stateless)
 * ============================================================
 */

// ── Cache por invocação (resetado a cada server call) ───────
var _ss = null;
var _sheets = {};

/**
 * Retorna referência ao spreadsheet ativo (com cache).
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getSpreadsheet_() {
  if (!_ss) {
    _ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  return _ss;
}

/**
 * Retorna a sheet por nome (com cache).
 * @param {string} sheetName
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 * @throws {Error} se a aba não existir
 */
function getSheet_(sheetName) {
  if (!_sheets[sheetName]) {
    var sheet = getSpreadsheet_().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Aba nao encontrada: ' + sheetName);
    }
    _sheets[sheetName] = sheet;
  }
  return _sheets[sheetName];
}

// ── Namespace DAL ───────────────────────────────────────────
var DAL = {

  /**
   * Lê todas as linhas de dados de uma aba (exclui header/linha 1).
   * @param {string} sheetName
   * @returns {Array<Array<any>>} Array 2D de valores
   */
  readAll: function(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return [];
    return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  },

  /**
   * Lê a linha de cabeçalho (linha 1).
   * @param {string} sheetName
   * @returns {Array<string>}
   */
  readHeaders: function(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return [];
    return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  },

  /**
   * Lê linhas que satisfazem uma função predicado.
   * @param {string} sheetName
   * @param {Function} predicateFn - function(row) retornando boolean
   * @returns {Array<{rowIndex: number, data: Array<any>}>}
   *          rowIndex é 1-based (header=1, primeiro dado=2)
   */
  readWhere: function(sheetName, predicateFn) {
    var allRows = DAL.readAll(sheetName);
    var results = [];
    for (var i = 0; i < allRows.length; i++) {
      if (predicateFn(allRows[i])) {
        results.push({
          rowIndex: i + 2,  // +2 porque: array 0-based + header na linha 1
          data: allRows[i]
        });
      }
    }
    return results;
  },

  /**
   * Encontra uma única linha por valor em uma coluna específica.
   * @param {string} sheetName
   * @param {number} colIndex - índice 1-based da coluna
   * @param {any} value - valor a buscar
   * @returns {{rowIndex: number, data: Array<any>}|null}
   */
  findRow: function(sheetName, colIndex, value) {
    var allRows = DAL.readAll(sheetName);
    for (var i = 0; i < allRows.length; i++) {
      if (String(allRows[i][colIndex - 1]) === String(value)) {
        return {
          rowIndex: i + 2,
          data: allRows[i]
        };
      }
    }
    return null;
  },

  /**
   * Adiciona uma linha ao final da aba.
   * @param {string} sheetName
   * @param {Array<any>} rowData
   */
  appendRow: function(sheetName, rowData) {
    var sheet = getSheet_(sheetName);
    sheet.appendRow(rowData);
  },

  /**
   * Adiciona múltiplas linhas ao final da aba em uma operação.
   * @param {string} sheetName
   * @param {Array<Array<any>>} rows
   */
  appendRows: function(sheetName, rows) {
    if (!rows || rows.length === 0) return;
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    var numCols = rows[0].length;
    sheet.getRange(lastRow + 1, 1, rows.length, numCols).setValues(rows);
  },

  /**
   * Atualiza uma linha inteira (sobrescreve da coluna 1).
   * @param {string} sheetName
   * @param {number} rowIndex - índice 1-based da linha na sheet
   * @param {Array<any>} rowData
   */
  updateRow: function(sheetName, rowIndex, rowData) {
    var sheet = getSheet_(sheetName);
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  },

  /**
   * Atualiza uma célula específica.
   * @param {string} sheetName
   * @param {number} rowIndex - 1-based
   * @param {number} colIndex - 1-based
   * @param {any} value
   */
  updateCell: function(sheetName, rowIndex, colIndex, value) {
    var sheet = getSheet_(sheetName);
    sheet.getRange(rowIndex, colIndex).setValue(value);
  },

  /**
   * Escreve um bloco 2D de dados a partir de uma posição.
   * Usado para tabelas do Dashboard.
   * @param {string} sheetName
   * @param {number} startRow - 1-based
   * @param {number} startCol - 1-based
   * @param {Array<Array<any>>} data
   */
  writeBlock: function(sheetName, startRow, startCol, data) {
    if (!data || data.length === 0) return;
    var sheet = getSheet_(sheetName);
    var numRows = data.length;
    var numCols = data[0].length;
    sheet.getRange(startRow, startCol, numRows, numCols).setValues(data);
  },

  /**
   * Retorna o número de linhas de dados (total - header).
   * @param {string} sheetName
   * @returns {number}
   */
  countRows: function(sheetName) {
    var sheet = getSheet_(sheetName);
    return Math.max(0, sheet.getLastRow() - 1);
  },

  /**
   * Limpa todas as linhas de dados (mantém o header).
   * @param {string} sheetName
   */
  clearData: function(sheetName) {
    var sheet = getSheet_(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
  }
};


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 7: 07_BusinessRules █████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Motor de Regras Normativas
 * ============================================================
 * Calcula exigências com base na NORMAS_MATRIX extraída do
 * "Resumo de Normas de Contratações de Terceiros".
 *
 * Salvaguardas: validações pré-criação, pré-edição, pré-avanço
 * de etapa e compatibilidade de fornecedor, com mensagens que
 * citam a seção normativa específica.
 *
 * Normativos: NP AC.03.004, NP AC.03.006, NP AC.03.002,
 *             NP AF.03.003, Portaria 24/2024
 * ============================================================
 */

// ── Helpers ─────────────────────────────────────────────────

/**
 * Determina a faixa de valor normativa a partir do valor estimado.
 * @param {number} valor
 * @returns {{id: number, label: string}}
 */
function determinarFaixaValor_(valor) {
  valor = parseFloat(valor) || 0;
  for (var i = 0; i < FAIXAS_VALOR.length; i++) {
    if (valor >= FAIXAS_VALOR[i].min && valor <= FAIXAS_VALOR[i].max) {
      return FAIXAS_VALOR[i];
    }
  }
  return FAIXAS_VALOR[FAIXAS_VALOR.length - 1];
}

/**
 * Converte PAR legível ("Sem PAR"/"Com PAR") para chave da matriz.
 * @param {string} par
 * @returns {string}
 */
function parToKey_(par) {
  return par === 'Com PAR' ? 'COM_PAR' : 'SEM_PAR';
}

/**
 * Converte duração legível para chave da matriz.
 * @param {string} duracao
 * @returns {string}
 */
function duracaoToKey_(duracao) {
  return duracao === 'Prolongada' ? 'PROLONGADA' : 'IMEDIATA';
}

// ═══════════════════════════════════════════════════════════════
// CONSULTA À MATRIZ NORMATIVA (substitui calcularRequisitos)
// ═══════════════════════════════════════════════════════════════

/**
 * Consulta a NORMAS_MATRIX e retorna os 6 flags de exigência
 * + metadados normativos (seção, faixa de valor).
 *
 * @param {Object} params
 * @param {string} params.tipoServico   - Ex: "Servico tecnico por PJ"
 * @param {string} params.par           - "Sem PAR" ou "Com PAR"
 * @param {string} params.duracao       - "Imediata" ou "Prolongada"
 * @param {number} params.valorEstimado - Valor em BRL
 *
 * @returns {Object} {
 *   flags: { cadastramento, credenciamento, mapaCotacao, proposta, compliance, contrato },
 *   secao: string,
 *   faixaLabel: string,
 *   found: boolean
 * }
 */
function consultarMatrizNormativa(params) {
  var faixa = determinarFaixaValor_(params.valorEstimado);
  var tipoKey = TIPO_SERVICO_KEY[params.tipoServico] || '';
  var parKey = parToKey_(params.par);
  var durKey = duracaoToKey_(params.duracao);

  var chave = parKey + '|' + durKey + '|' + faixa.id + '|' + tipoKey;
  var entry = NORMAS_MATRIX[chave];

  if (!entry) {
    // Fallback: retorna tudo obrigatório por segurança (princípio conservador)
    return {
      flags: {
        cadastramento: true, credenciamento: true, mapaCotacao: true,
        proposta: true, compliance: true, contrato: true
      },
      secao: 'N/D',
      faixaLabel: faixa.label,
      found: false
    };
  }

  return {
    flags: {
      cadastramento:  entry.cad,
      credenciamento: entry.cred,
      mapaCotacao:    entry.mapa,
      proposta:       entry.prop,
      compliance:     entry.comp,
      contrato:       entry.contr
    },
    secao: entry.secao,
    faixaLabel: faixa.label,
    found: true
  };
}

/**
 * Wrapper de compatibilidade — chama consultarMatrizNormativa
 * e retorna flags no formato antigo (5 campos) para código legado.
 * Se tipoServico/par/duracao não forem fornecidos, usa regras simplificadas.
 */
function calcularRequisitos(params) {
  // Se novos campos estão presentes, usar a matriz normativa
  if (params.tipoServico && params.par && params.duracao) {
    var resultado = consultarMatrizNormativa(params);
    return {
      cadastramento:  resultado.flags.cadastramento,
      credenciamento: resultado.flags.credenciamento,
      mapaCotacao:    resultado.flags.mapaCotacao,
      proposta:       resultado.flags.proposta,
      compliance:     resultado.flags.compliance,
      contrato:       resultado.flags.contrato,
      _secao:         resultado.secao,
      _faixaLabel:    resultado.faixaLabel,
      _found:         resultado.found
    };
  }

  // Fallback legado (sem tipoServico/par/duracao)
  var valor = parseFloat(params.valorEstimado) || 0;
  return {
    cadastramento:  true,
    credenciamento: params.naturezaTerceiro === 'Pessoa Juridica',
    mapaCotacao:    valor >= THRESHOLDS.COLETA_PRECOS_VALOR,
    proposta:       params.formaContratacao === 'Contrato' || valor >= THRESHOLDS.PROPOSTA_VALOR,
    compliance:     valor >= THRESHOLDS.COMPLIANCE_VALOR || params.naturezaContratacao === 'Obra',
    contrato:       params.formaContratacao === 'Contrato' || valor >= THRESHOLDS.CONTRATO_VALOR,
    _secao:         'legado',
    _faixaLabel:    '',
    _found:         false
  };
}

// ═══════════════════════════════════════════════════════════════
// GERADOR DE MENSAGENS NORMATIVAS
// ═══════════════════════════════════════════════════════════════

/**
 * Gera mensagem padronizada de salvaguarda normativa.
 *
 * @param {Object} opts
 * @param {string} opts.acao         - "BLOQUEADO" ou "ATENCAO"
 * @param {string} opts.secao        - Seção do resumo (ex: "1.1.3")
 * @param {string} opts.tipoServico  - Tipo de serviço
 * @param {string} opts.faixaLabel   - Faixa de valor legível
 * @param {string} opts.par          - "Sem PAR" ou "Com PAR"
 * @param {string} opts.duracao      - "Imediata" ou "Prolongada"
 * @param {string} opts.requisito    - Nome do requisito (ex: "Credenciamento")
 * @param {string} opts.complemento  - Texto adicional
 * @returns {string}
 */
function gerarMensagemNormativa(opts) {
  var parTexto = opts.par === 'Com PAR' ? 'com PAR' : 'sem PAR';
  var durTexto = opts.duracao === 'Prolongada' ? 'prolongada' : 'imediata';

  return opts.acao + ': Conforme Resumo de Normas de Contratacoes de Terceiros '
    + '(secao ' + opts.secao + '), para ' + opts.tipoServico
    + ' com valor ' + opts.faixaLabel
    + ' em contratacao ' + durTexto + ' ' + parTexto
    + ', ' + opts.requisito + '. '
    + (opts.complemento || '');
}

// ═══════════════════════════════════════════════════════════════
// SALVAGUARDA 1: VALIDAÇÃO PRÉ-CRIAÇÃO DE PROCESSO
// ═══════════════════════════════════════════════════════════════

/**
 * Valida dados do formulário ANTES de criar o processo.
 * Retorna objeto com { valid, errors[], warnings[], flags, secao }.
 *
 * @param {Object} formData
 * @returns {Object}
 */
function validarCriacaoProcesso(formData) {
  var errors = [];
  var warnings = [];

  // 1. Validar tipo de serviço
  if (!formData.tipoServico || TIPOS_SERVICO.indexOf(formData.tipoServico) === -1) {
    errors.push('Tipo de Servico invalido. Opcoes: ' + TIPOS_SERVICO.join(', '));
  }

  // 2. Validar PAR
  if (!formData.par || OPCOES_PAR.indexOf(formData.par) === -1) {
    errors.push('Campo PAR obrigatorio. Opcoes: ' + OPCOES_PAR.join(', '));
  }

  // 3. Validar Duração
  if (!formData.duracao || OPCOES_DURACAO.indexOf(formData.duracao) === -1) {
    errors.push('Campo Duracao obrigatorio. Opcoes: ' + OPCOES_DURACAO.join(', '));
  }

  // 4. Cross-validation: Aquisição de bens → só PJ
  if (formData.tipoServico === 'Aquisicao de bens de PJ'
      && formData.naturezaTerceiro === 'Pessoa Fisica') {
    errors.push('BLOQUEADO: Aquisicao de bens e restrita a Pessoa Juridica '
      + 'conforme Resumo Normas, secoes 1.x e 2.x. Apenas fornecedores PJ (CNPJ) sao aceitos.');
  }

  // 5. Cross-validation: Tipo de serviço PF vs PJ coerência
  if (formData.tipoServico && formData.naturezaTerceiro) {
    var ehPF = formData.tipoServico.indexOf('PF autonomo') !== -1;
    var ehPJ = formData.tipoServico.indexOf('de PJ') !== -1 || formData.tipoServico.indexOf('por PJ') !== -1;
    if (ehPF && formData.naturezaTerceiro === 'Pessoa Juridica') {
      errors.push('Tipo de Servico indica PF autonomo, mas Natureza do Terceiro e Pessoa Juridica. Corrija a inconsistencia.');
    }
    if (ehPJ && formData.naturezaTerceiro === 'Pessoa Fisica') {
      errors.push('Tipo de Servico indica PJ, mas Natureza do Terceiro e Pessoa Fisica. Corrija a inconsistencia.');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors: errors, warnings: warnings, flags: null, secao: null };
  }

  // 6. Consultar matriz normativa
  var resultado = consultarMatrizNormativa({
    tipoServico:   formData.tipoServico,
    par:           formData.par,
    duracao:       formData.duracao,
    valorEstimado: parseFloat(formData.valorEstimado) || 0
  });

  // 7. Warnings informativos sobre requisitos ativados
  var flagKeys = Object.keys(resultado.flags);
  var obrigatorios = [];
  for (var i = 0; i < flagKeys.length; i++) {
    if (resultado.flags[flagKeys[i]]) {
      obrigatorios.push(NOMES_REQUISITOS[flagKeys[i].replace('cadastramento','cad')
        .replace('credenciamento','cred').replace('mapaCotacao','mapa')
        .replace('proposta','prop').replace('compliance','comp')
        .replace('contrato','contr')] || flagKeys[i]);
    }
  }
  if (obrigatorios.length > 0) {
    warnings.push('Conforme secao ' + resultado.secao + ': exigencias obrigatorias para esta contratacao: '
      + obrigatorios.join(', ') + '.');
  }

  if (!resultado.found) {
    warnings.push('ATENCAO: Combinacao nao encontrada na matriz normativa. Todas as exigencias foram ativadas por precaucao.');
  }

  return {
    valid: true,
    errors: [],
    warnings: warnings,
    flags: resultado.flags,
    secao: resultado.secao,
    faixaLabel: resultado.faixaLabel
  };
}

// ═══════════════════════════════════════════════════════════════
// SALVAGUARDA 2: VALIDAÇÃO PRÉ-EDIÇÃO DE PROCESSO
// ═══════════════════════════════════════════════════════════════

/**
 * Valida edição de processo, detectando mudanças que afetam requisitos.
 * Compara flags antigos com novos e gera warnings/bloqueios.
 *
 * @param {Array} dadosAtuais - Row atual do processo
 * @param {Object} novosDados - Campos sendo alterados
 * @returns {Object} { valid, errors[], warnings[], newFlags, secao }
 */
function validarEdicaoProcesso(dadosAtuais, novosDados) {
  var errors = [];
  var warnings = [];

  // Montar parâmetros resultantes (merge atual + novo)
  var tipoServico = novosDados.tipoServico || dadosAtuais[COL_PROC.TIPO_SERVICO - 1] || '';
  var par = novosDados.par || dadosAtuais[COL_PROC.PAR - 1] || 'Sem PAR';
  var duracao = novosDados.duracao || dadosAtuais[COL_PROC.DURACAO_CONTRATO - 1] || 'Imediata';
  var valor = novosDados.valorEstimado !== undefined
    ? parseFloat(novosDados.valorEstimado)
    : parseFloat(dadosAtuais[COL_PROC.VALOR_ESTIMADO - 1]) || 0;

  // Cross-validations
  var natTerceiro = novosDados.naturezaTerceiro || dadosAtuais[COL_PROC.NATUREZA_TERCEIRO - 1] || '';
  if (tipoServico === 'Aquisicao de bens de PJ' && natTerceiro === 'Pessoa Fisica') {
    errors.push('BLOQUEADO: Aquisicao de bens e restrita a PJ.');
  }

  if (tipoServico) {
    var ehPF = tipoServico.indexOf('PF autonomo') !== -1;
    var ehPJ = tipoServico.indexOf('de PJ') !== -1 || tipoServico.indexOf('por PJ') !== -1;
    if (ehPF && natTerceiro === 'Pessoa Juridica') {
      errors.push('Tipo de Servico indica PF autonomo, mas Natureza do Terceiro e PJ.');
    }
    if (ehPJ && natTerceiro === 'Pessoa Fisica') {
      errors.push('Tipo de Servico indica PJ, mas Natureza do Terceiro e PF.');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors: errors, warnings: warnings, newFlags: null, secao: null };
  }

  // Consultar nova matriz (se tipoServico está definido)
  if (!tipoServico || TIPOS_SERVICO.indexOf(tipoServico) === -1) {
    // Sem tipo de serviço normativo, usar fallback legado
    return { valid: true, errors: [], warnings: [], newFlags: null, secao: null };
  }

  var resultado = consultarMatrizNormativa({
    tipoServico: tipoServico, par: par, duracao: duracao, valorEstimado: valor
  });

  // Detectar mudança de faixa de valor
  var valorAntigo = parseFloat(dadosAtuais[COL_PROC.VALOR_ESTIMADO - 1]) || 0;
  var faixaAntiga = determinarFaixaValor_(valorAntigo);
  var faixaNova = determinarFaixaValor_(valor);

  if (faixaAntiga.id !== faixaNova.id) {
    // Identificar requisitos que passaram a ser obrigatórios
    var novosRequisitos = [];
    var flagKeys = ['cad','cred','mapa','prop','comp','contr'];
    var flagLong = ['cadastramento','credenciamento','mapaCotacao','proposta','compliance','contrato'];
    for (var i = 0; i < flagLong.length; i++) {
      if (resultado.flags[flagLong[i]]) {
        novosRequisitos.push(NOMES_REQUISITOS[flagKeys[i]]);
      }
    }
    warnings.push(gerarMensagemNormativa({
      acao: 'ATENCAO',
      secao: resultado.secao,
      tipoServico: tipoServico,
      faixaLabel: resultado.faixaLabel,
      par: par,
      duracao: duracao,
      requisito: 'as seguintes exigencias passam a ser obrigatorias: ' + novosRequisitos.join(', '),
      complemento: 'Mudanca de faixa de valor: ' + faixaAntiga.label + ' -> ' + faixaNova.label + '.'
    }));
  }

  return {
    valid: true,
    errors: [],
    warnings: warnings,
    newFlags: resultado.flags,
    secao: resultado.secao,
    faixaLabel: resultado.faixaLabel
  };
}

// ═══════════════════════════════════════════════════════════════
// SALVAGUARDA 3: VALIDAÇÃO PRÉ-AVANÇO DE ETAPA
// ═══════════════════════════════════════════════════════════════

/**
 * Verifica se uma etapa pode ser marcada como N/A ou pulada.
 * Se a etapa é obrigatória conforme a matriz normativa, BLOQUEIA.
 *
 * @param {string} processoId
 * @param {number} etapaNum - Número da etapa (1-23)
 * @returns {Object} { allowed, message }
 */
function validarAvancoEtapa(processoId, etapaNum) {
  // Ler dados do processo
  var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, processoId);
  if (!proc) {
    return { allowed: true, message: '' }; // processo não encontrado → não bloquear
  }

  var row = proc.data;
  var tipoServico = row[COL_PROC.TIPO_SERVICO - 1];
  var par = row[COL_PROC.PAR - 1];
  var duracao = row[COL_PROC.DURACAO_CONTRATO - 1];
  var valor = parseFloat(row[COL_PROC.VALOR_ESTIMADO - 1]) || 0;

  // Se não tem tipo de serviço normativo, não bloquear
  if (!tipoServico || TIPOS_SERVICO.indexOf(tipoServico) === -1) {
    return { allowed: true, message: '' };
  }

  var resultado = consultarMatrizNormativa({
    tipoServico: tipoServico, par: par || 'Sem PAR',
    duracao: duracao || 'Imediata', valorEstimado: valor
  });

  // Verificar se a etapa sendo concluída/pulada é obrigatória
  var flagLong = Object.keys(FLAG_TO_STAGE);
  for (var f = 0; f < flagLong.length; f++) {
    var flagName = flagLong[f];
    var stageNums = FLAG_TO_STAGE[flagName];

    // A etapa está neste grupo de flags?
    if (stageNums.indexOf(etapaNum) === -1) continue;

    // Este flag é obrigatório?
    if (resultado.flags[flagName]) {
      // A etapa é obrigatória — verificar se está sendo pulada (N/A)
      var stageRows = DAL.readWhere(SHEET.ETAPAS, function(r) {
        return String(r[COL_ETAPA.ID_PROCESSO - 1]) === processoId
          && r[COL_ETAPA.NUM - 1] === etapaNum;
      });
      if (stageRows.length > 0 && stageRows[0].data[COL_ETAPA.STATUS - 1] === STATUS.NAO_APLICAVEL) {
        // Tentando avançar sobre etapa N/A que deveria ser obrigatória
        var nomeRequisito = NOMES_REQUISITOS[
          Object.keys(FLAG_SHORT_TO_LONG).filter(function(k) { return FLAG_SHORT_TO_LONG[k] === flagName; })[0]
        ] || flagName;

        return {
          allowed: false,
          message: gerarMensagemNormativa({
            acao: 'BLOQUEADO',
            secao: resultado.secao,
            tipoServico: tipoServico,
            faixaLabel: resultado.faixaLabel,
            par: par || 'Sem PAR',
            duracao: duracao || 'Imediata',
            requisito: 'o ' + nomeRequisito + ' e OBRIGATORIO',
            complemento: 'Esta etapa nao pode ser marcada como N/A.'
          })
        };
      }
    }
  }

  return { allowed: true, message: '' };
}

// ═══════════════════════════════════════════════════════════════
// SALVAGUARDA 4: COMPATIBILIDADE FORNECEDOR × PROCESSO
// ═══════════════════════════════════════════════════════════════

/**
 * Valida se o tipo de fornecedor (PJ/PF) é compatível
 * com o tipo de serviço do processo.
 *
 * @param {string} tipoServico - Tipo de serviço do processo
 * @param {string} tipoFornecedor - "Pessoa Juridica" ou "Pessoa Fisica"
 * @returns {Object} { compatible, message }
 */
function validarFornecedorParaProcesso(tipoServico, tipoFornecedor) {
  if (!tipoServico || TIPOS_SERVICO.indexOf(tipoServico) === -1) {
    return { compatible: true, message: '' };
  }

  var exigePJ = tipoServico.indexOf('de PJ') !== -1 || tipoServico.indexOf('por PJ') !== -1;
  var exigePF = tipoServico.indexOf('PF autonomo') !== -1;

  if (exigePJ && tipoFornecedor === 'Pessoa Fisica') {
    return {
      compatible: false,
      message: 'BLOQUEADO: O tipo de servico "' + tipoServico
        + '" exige fornecedor Pessoa Juridica (PJ). '
        + 'Fornecedor PF nao e aceito para esta contratacao.'
    };
  }

  if (exigePF && tipoFornecedor === 'Pessoa Juridica') {
    return {
      compatible: false,
      message: 'BLOQUEADO: O tipo de servico "' + tipoServico
        + '" exige fornecedor Pessoa Fisica (PF autonomo). '
        + 'Fornecedor PJ nao e aceito para esta contratacao.'
    };
  }

  return { compatible: true, message: '' };
}

// ═══════════════════════════════════════════════════════════════
// FUNÇÕES INTERNAS DE APLICAÇÃO DE FLAGS
// ═══════════════════════════════════════════════════════════════

/**
 * Aplica os flags de requisitos nas linhas de Etapas de um processo.
 * Etapas não obrigatórias são marcadas como "N/A".
 * DEVE ser chamada dentro de withDocumentLock().
 *
 * @param {string} processoId
 * @param {Object} flags - Saída de calcularRequisitos() (6 flags)
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
 * Define os valores das 6 colunas de flags na linha do processo.
 * Inclui os novos campos TIPO_SERVICO, PAR, DURACAO_CONTRATO, CADASTRAMENTO.
 *
 * @param {Array<any>} processoRow - Array representando a linha do processo
 * @param {Object} flags - Saída de calcularRequisitos() (6 flags)
 * @returns {Array<any>} O mesmo array modificado
 */
function setProcessFlags_(processoRow, flags) {
  // Colunas 17-21: flags de etapas (mantendo nomes originais das colunas)
  processoRow[COL_PROC.COLETA_PRECOS - 1]  = flags.mapaCotacao     ? 'Obrigatorio' : 'N/A';
  processoRow[COL_PROC.PROPOSTA - 1]        = flags.proposta        ? 'Obrigatorio' : 'N/A';
  processoRow[COL_PROC.CREDENCIAMENTO - 1]  = flags.credenciamento  ? 'Obrigatorio' : 'N/A';
  processoRow[COL_PROC.COMPLIANCE - 1]      = flags.compliance      ? 'Obrigatorio' : 'N/A';
  processoRow[COL_PROC.CONTRATO - 1]        = flags.contrato        ? 'Obrigatorio' : 'N/A';
  // Coluna 28: Cadastramento
  processoRow[COL_PROC.CADASTRAMENTO - 1]   = flags.cadastramento   ? 'Obrigatorio' : 'N/A';
  return processoRow;
}

/**
 * Retorna descrição textual dos requisitos aplicáveis (para display).
 * Atualizado para 6 flags + referência normativa.
 *
 * @param {Object} flags
 * @param {string} [secao] - Seção do resumo normativo
 * @returns {string}
 */
function descreverRequisitos(flags, secao) {
  var nomes = {
    cadastramento:  'Cadastramento',
    credenciamento: 'Credenciamento',
    mapaCotacao:    'Mapa de Cotacao',
    proposta:       'Proposta Comercial',
    compliance:     'Compliance/Due Diligence (DCI)',
    contrato:       'Instrumento Contratual'
  };

  var obrigatorios = [];
  var flagNames = Object.keys(nomes);
  for (var i = 0; i < flagNames.length; i++) {
    if (flags[flagNames[i]]) {
      obrigatorios.push(nomes[flagNames[i]]);
    }
  }

  var desc = obrigatorios.length > 0
    ? 'Obrigatorios: ' + obrigatorios.join(', ')
    : 'Nenhuma exigencia adicional';

  if (secao && secao !== 'legado' && secao !== 'N/D') {
    desc += ' (Resumo Normas, secao ' + secao + ')';
  }

  return desc;
}


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 8: 06_Etapas ████████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Gestão de Etapas
 * ============================================================
 * Criação, consulta e avanço das 23 etapas do ciclo de
 * contratação. Avanço automático e cálculo de "Dias em Aberto".
 * ============================================================
 */

/**
 * Cria as 23 linhas de etapas para um novo processo.
 * DEVE ser chamada dentro de withDocumentLock().
 *
 * @param {string} processoId - ID do processo (ex: "DINT-2026-001")
 */
function criarEtapasParaProcesso_(processoId) {
  var hoje = new Date();
  var rows = [];

  for (var i = 0; i < STAGES.length; i++) {
    var stage = STAGES[i];
    rows.push([
      processoId,               // ID Processo
      stage.num,                // Nº Etapa
      stage.name,               // Etapa
      stage.responsible,        // Responsável
      STATUS.PENDENTE,          // Status (todas iniciam Pendente)
      '',                       // Data Início
      '',                       // Data Conclusão
      '',                       // Prazo Limite
      '',                       // Documento Ref.
      ''                        // Observações
    ]);
  }

  // Primeira etapa começa como "Em Andamento" com data de hoje
  rows[0][COL_ETAPA.STATUS - 1]      = STATUS.EM_ANDAMENTO;
  rows[0][COL_ETAPA.DATA_INICIO - 1] = hoje;

  DAL.appendRows(SHEET.ETAPAS, rows);
}

/**
 * Consulta todas as etapas de um processo.
 * Operação de leitura — sem lock.
 *
 * @param {string} processoId
 * @returns {{success: boolean, data: Array<Object>, message: string}}
 */
function consultarEtapas(processoId) {
  try {
    var rows = DAL.readWhere(SHEET.ETAPAS, function(row) {
      return String(row[COL_ETAPA.ID_PROCESSO - 1]) === processoId;
    });

    var etapas = rows.map(function(r) {
      return {
        idProcesso:    r.data[COL_ETAPA.ID_PROCESSO - 1],
        num:           r.data[COL_ETAPA.NUM - 1],
        etapa:         r.data[COL_ETAPA.ETAPA - 1],
        responsavel:   r.data[COL_ETAPA.RESPONSAVEL - 1],
        status:        r.data[COL_ETAPA.STATUS - 1],
        dataInicio:    r.data[COL_ETAPA.DATA_INICIO - 1],
        dataConclusao: r.data[COL_ETAPA.DATA_CONCLUSAO - 1],
        prazoLimite:   r.data[COL_ETAPA.PRAZO_LIMITE - 1],
        documentoRef:  r.data[COL_ETAPA.DOCUMENTO_REF - 1],
        observacoes:   r.data[COL_ETAPA.OBSERVACOES - 1],
        rowIndex:      r.rowIndex
      };
    });

    // Ordenar por número da etapa
    etapas.sort(function(a, b) { return a.num - b.num; });

    return {
      success: true,
      data: etapas,
      message: etapas.length + ' etapa(s) encontrada(s).'
    };
  } catch (e) {
    return { success: false, data: [], message: 'Erro ao consultar etapas: ' + e.message };
  }
}

/**
 * Conclui uma etapa e avança automaticamente para a próxima não-N/A.
 * Atualiza o campo "Etapa Atual" no processo pai.
 * Se todas forem concluídas, marca o processo como "Concluído".
 *
 * @param {string} processoId
 * @param {number} etapaNum - Número da etapa sendo concluída (1-23)
 * @returns {{success: boolean, message: string, nextStage: number|null}}
 */
function concluirEtapa(processoId, etapaNum) {
  return withDocumentLock(function() {
    // SALVAGUARDA NORMATIVA: verificar se etapa pode ser avançada/pulada
    var validacaoAvanco = validarAvancoEtapa(processoId, etapaNum);
    if (!validacaoAvanco.allowed) {
      return { success: false, message: validacaoAvanco.message, nextStage: null };
    }

    // 1. Ler todas as etapas do processo
    var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
      return String(row[COL_ETAPA.ID_PROCESSO - 1]) === processoId;
    });

    if (stageRows.length === 0) {
      return { success: false, message: 'Etapas nao encontradas para ' + processoId, nextStage: null };
    }

    // Ordenar por número
    stageRows.sort(function(a, b) {
      return a.data[COL_ETAPA.NUM - 1] - b.data[COL_ETAPA.NUM - 1];
    });

    // 2. Encontrar e marcar etapa atual como Concluída
    var current = null;
    for (var i = 0; i < stageRows.length; i++) {
      if (stageRows[i].data[COL_ETAPA.NUM - 1] === etapaNum) {
        current = stageRows[i];
        break;
      }
    }

    if (!current) {
      return { success: false, message: 'Etapa ' + etapaNum + ' nao encontrada.', nextStage: null };
    }

    if (current.data[COL_ETAPA.STATUS - 1] === STATUS.CONCLUIDO) {
      return { success: false, message: 'Etapa ' + etapaNum + ' ja esta concluida.', nextStage: null };
    }

    current.data[COL_ETAPA.STATUS - 1]          = STATUS.CONCLUIDO;
    current.data[COL_ETAPA.DATA_CONCLUSAO - 1]   = new Date();
    DAL.updateRow(SHEET.ETAPAS, current.rowIndex, current.data);

    // 3. Encontrar próxima etapa não-N/A e Pendente
    var nextStage = null;
    for (var j = 0; j < stageRows.length; j++) {
      var s = stageRows[j];
      if (s.data[COL_ETAPA.NUM - 1] > etapaNum
          && s.data[COL_ETAPA.STATUS - 1] === STATUS.PENDENTE) {
        nextStage = s;
        break;
      }
    }

    if (nextStage) {
      // Ativar próxima etapa
      nextStage.data[COL_ETAPA.STATUS - 1]      = STATUS.EM_ANDAMENTO;
      nextStage.data[COL_ETAPA.DATA_INICIO - 1]  = new Date();
      DAL.updateRow(SHEET.ETAPAS, nextStage.rowIndex, nextStage.data);

      // Atualizar "Etapa Atual" no processo
      var nextLabel = nextStage.data[COL_ETAPA.NUM - 1] + '. ' + nextStage.data[COL_ETAPA.ETAPA - 1];
      atualizarEtapaAtualProcesso_(processoId, nextLabel);

      logAction('CONCLUIR_ETAPA', processoId + ' - etapa ' + etapaNum
                + ' concluida. Proxima: ' + nextStage.data[COL_ETAPA.NUM - 1]);

      return {
        success: true,
        message: 'Etapa ' + etapaNum + ' concluida. Proxima: '
                 + nextStage.data[COL_ETAPA.NUM - 1] + '. ' + nextStage.data[COL_ETAPA.ETAPA - 1],
        nextStage: nextStage.data[COL_ETAPA.NUM - 1]
      };
    } else {
      // Verificar se TODAS as etapas estão concluídas ou N/A
      var allDone = stageRows.every(function(s) {
        var st = s.data[COL_ETAPA.STATUS - 1];
        return st === STATUS.CONCLUIDO || st === STATUS.NAO_APLICAVEL;
      });

      if (allDone) {
        atualizarStatusProcesso_(processoId, STATUS.CONCLUIDO);
        logAction('CONCLUIR_PROCESSO', processoId + ' - todas as etapas concluidas');
        return {
          success: true,
          message: 'Todas as etapas concluidas. Processo ' + processoId + ' finalizado.',
          nextStage: null
        };
      }

      logAction('CONCLUIR_ETAPA', processoId + ' - etapa ' + etapaNum + ' concluida (sem proxima pendente)');
      return {
        success: true,
        message: 'Etapa ' + etapaNum + ' concluida.',
        nextStage: null
      };
    }
  }, 'concluirEtapa');
}

/**
 * Atualiza campos de uma etapa específica (datas, docs, observações).
 *
 * @param {string} processoId
 * @param {number} etapaNum
 * @param {Object} updates - Campos a atualizar
 * @param {Date}   [updates.prazoLimite]
 * @param {string} [updates.documentoRef]
 * @param {string} [updates.observacoes]
 * @returns {{success: boolean, message: string}}
 */
function atualizarEtapa(processoId, etapaNum, updates) {
  return withDocumentLock(function() {
    var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
      return String(row[COL_ETAPA.ID_PROCESSO - 1]) === processoId
          && row[COL_ETAPA.NUM - 1] === etapaNum;
    });

    if (stageRows.length === 0) {
      return { success: false, message: 'Etapa nao encontrada.' };
    }

    var stage = stageRows[0];

    if (updates.prazoLimite !== undefined) {
      stage.data[COL_ETAPA.PRAZO_LIMITE - 1] = updates.prazoLimite;
    }
    if (updates.documentoRef !== undefined) {
      stage.data[COL_ETAPA.DOCUMENTO_REF - 1] = normalizeString(updates.documentoRef);
    }
    if (updates.observacoes !== undefined) {
      stage.data[COL_ETAPA.OBSERVACOES - 1] = normalizeString(updates.observacoes);
    }

    DAL.updateRow(SHEET.ETAPAS, stage.rowIndex, stage.data);

    logAction('ATUALIZAR_ETAPA', processoId + ' - etapa ' + etapaNum + ' atualizada');

    return { success: true, message: 'Etapa ' + etapaNum + ' atualizada.' };
  }, 'atualizarEtapa');
}

/**
 * Retorna a etapa atualmente ativa (Em Andamento) de um processo.
 * Sem lock (leitura).
 *
 * @param {string} processoId
 * @returns {{num: number, name: string, responsible: string}|null}
 */
function getEtapaAtual(processoId) {
  var stageRows = DAL.readWhere(SHEET.ETAPAS, function(row) {
    return String(row[COL_ETAPA.ID_PROCESSO - 1]) === processoId
        && row[COL_ETAPA.STATUS - 1] === STATUS.EM_ANDAMENTO;
  });

  if (stageRows.length === 0) return null;

  var s = stageRows[0].data;
  return {
    num: s[COL_ETAPA.NUM - 1],
    name: s[COL_ETAPA.ETAPA - 1],
    responsible: s[COL_ETAPA.RESPONSAVEL - 1]
  };
}

/**
 * Calcula dias em aberto desde a abertura do processo.
 * @param {Date} dataAbertura
 * @returns {number}
 */
function calcularDiasAberto(dataAbertura) {
  if (!dataAbertura || !(dataAbertura instanceof Date)) return 0;
  return Math.max(0, diffDays(new Date(), dataAbertura));
}

/**
 * Encontra a data da última transição de etapa (mais recente Data Conclusão).
 * @param {string} processoId
 * @param {Array<Array<any>>} [allEtapas] - se já carregado, passa para evitar releitura
 * @returns {Date|null}
 */
function getLastTransitionDate_(processoId, allEtapas) {
  var etapas = allEtapas || DAL.readAll(SHEET.ETAPAS);
  var lastDate = null;

  for (var i = 0; i < etapas.length; i++) {
    var row = etapas[i];
    // Se allEtapas é o resultado direto de readAll, row é Array; senão pode ser objeto
    var rowData = Array.isArray(row) ? row : row.data;
    if (String(rowData[COL_ETAPA.ID_PROCESSO - 1]) !== processoId) continue;

    var dataConclusao = rowData[COL_ETAPA.DATA_CONCLUSAO - 1];
    if (dataConclusao instanceof Date && !isNaN(dataConclusao.getTime())) {
      if (!lastDate || dataConclusao > lastDate) {
        lastDate = dataConclusao;
      }
    }
  }

  return lastDate;
}

// ── Helpers internos (atualizam Processos de dentro do lock) ──

/**
 * Atualiza o campo "Etapa Atual" de um processo.
 * DEVE ser chamada dentro de withDocumentLock().
 * @param {string} processoId
 * @param {string} etapaLabel - Ex: "3. Cadastro do Terceiro (Portal)"
 */
function atualizarEtapaAtualProcesso_(processoId, etapaLabel) {
  var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, processoId);
  if (proc) {
    proc.data[COL_PROC.ETAPA_ATUAL - 1] = etapaLabel;
    DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, proc.data);
  }
}

/**
 * Atualiza o Status Geral de um processo.
 * DEVE ser chamada dentro de withDocumentLock().
 * @param {string} processoId
 * @param {string} novoStatus
 */
function atualizarStatusProcesso_(processoId, novoStatus) {
  var proc = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, processoId);
  if (proc) {
    proc.data[COL_PROC.STATUS_GERAL - 1] = novoStatus;
    DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, proc.data);
  }
}


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 9: 04_Processos █████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Gestão de Processos
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
      // 1. Validar campos obrigatórios (incluindo novos campos normativos)
      var validation = validateRequired(formData, [
        'descricao', 'tipoContratacao', 'naturezaTerceiro',
        'naturezaContratacao', 'formaContratacao', 'valorEstimado',
        'tipoServico', 'par', 'duracao'
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

      // 2. SALVAGUARDA NORMATIVA: validação pré-criação
      var salvaguarda = validarCriacaoProcesso(formData);
      if (!salvaguarda.valid) {
        return {
          success: false,
          message: salvaguarda.errors.join(' | '),
          data: null
        };
      }

      // 3. Gerar ID sequencial
      var allProcessos = DAL.readAll(SHEET.PROCESSOS);
      var newId = generateNextId_(allProcessos);

      // 4. Calcular flags de exigência via matriz normativa
      var flags = calcularRequisitos({
        tipoServico:         formData.tipoServico,
        par:                 formData.par,
        duracao:             formData.duracao,
        tipoContratacao:     formData.tipoContratacao,
        naturezaTerceiro:    formData.naturezaTerceiro,
        naturezaContratacao: formData.naturezaContratacao,
        formaContratacao:    formData.formaContratacao,
        valorEstimado:       parseFloat(formData.valorEstimado)
      });

      // 5. Montar linha do processo (28 colunas)
      var hoje = new Date();
      var prazoDias = parseInt(formData.prazoPrevisto, 10) || 30;
      var prazoPrevisto = new Date(hoje.getTime() + prazoDias * 24 * 60 * 60 * 1000);

      var newRow = new Array(28);
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
      // Novos campos normativos
      newRow[COL_PROC.TIPO_SERVICO - 1]         = formData.tipoServico;
      newRow[COL_PROC.PAR - 1]                  = formData.par;
      newRow[COL_PROC.DURACAO_CONTRATO - 1]     = formData.duracao;

      // Aplicar flags (inclui coluna 28: Cadastramento)
      setProcessFlags_(newRow, flags);

      // 6. Gravar processo
      DAL.appendRow(SHEET.PROCESSOS, newRow);

      // 7. Criar 23 etapas
      criarEtapasParaProcesso_(newId);

      // 8. Aplicar flags nas etapas (marcar N/A)
      aplicarRequisitosEtapas_(newId, flags);

      // 9. Log (com referência normativa)
      var secao = flags._secao || '';
      logAction('CRIAR_PROCESSO', 'Processo ' + newId + ' criado - '
                + formData.descricao + ' | ' + descreverRequisitos(flags, secao));

      // 10. Retorno com warnings informativos
      var msgSucesso = 'Processo ' + newId + ' criado com sucesso.';
      if (salvaguarda.warnings && salvaguarda.warnings.length > 0) {
        msgSucesso += ' INFO: ' + salvaguarda.warnings.join(' ');
      }

      return {
        success: true,
        message: msgSucesso,
        data: { id: newId, flags: flags, secao: secao, warnings: salvaguarda.warnings }
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
        alertas:              row[COL_PROC.ALERTAS - 1],
        tipoServico:          row[COL_PROC.TIPO_SERVICO - 1] || '',
        par:                  row[COL_PROC.PAR - 1] || '',
        duracaoContrato:      row[COL_PROC.DURACAO_CONTRATO - 1] || '',
        cadastramento:        row[COL_PROC.CADASTRAMENTO - 1] || ''
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
      // Novos campos normativos
      if (formData.tipoServico !== undefined) {
        row[COL_PROC.TIPO_SERVICO - 1] = formData.tipoServico;
        recalcFlags = true;
      }
      if (formData.par !== undefined) {
        row[COL_PROC.PAR - 1] = formData.par;
        recalcFlags = true;
      }
      if (formData.duracao !== undefined) {
        row[COL_PROC.DURACAO_CONTRATO - 1] = formData.duracao;
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

      // SALVAGUARDA NORMATIVA: validação pré-edição
      if (recalcFlags) {
        var validacao = validarEdicaoProcesso(proc.data, formData);
        if (!validacao.valid) {
          return { success: false, message: validacao.errors.join(' | ') };
        }

        // Recalcular flags com a matriz normativa
        var flags = calcularRequisitos({
          tipoServico:         row[COL_PROC.TIPO_SERVICO - 1],
          par:                 row[COL_PROC.PAR - 1],
          duracao:             row[COL_PROC.DURACAO_CONTRATO - 1],
          tipoContratacao:     row[COL_PROC.TIPO_CONTRATACAO - 1],
          naturezaTerceiro:    row[COL_PROC.NATUREZA_TERCEIRO - 1],
          naturezaContratacao: row[COL_PROC.NATUREZA_CONTRATACAO - 1],
          formaContratacao:    row[COL_PROC.FORMA_CONTRATACAO - 1],
          valorEstimado:       row[COL_PROC.VALOR_ESTIMADO - 1]
        });
        setProcessFlags_(row, flags);
        aplicarRequisitosEtapas_(id, flags);

        // Expandir row se necessário (processos antigos com 24 colunas)
        while (row.length < 28) { row.push(''); }

        DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, row);

        var msgLog = 'Processo ' + id + ' editado (flags recalculados - secao ' + (flags._secao || 'N/D') + ')';
        if (validacao.warnings && validacao.warnings.length > 0) {
          msgLog += ' | WARNINGS: ' + validacao.warnings.join('; ');
        }
        logAction('EDITAR_PROCESSO', msgLog);

        var msgRetorno = 'Processo ' + id + ' atualizado.';
        if (validacao.warnings && validacao.warnings.length > 0) {
          msgRetorno += ' INFO: ' + validacao.warnings.join(' ');
        }
        return { success: true, message: msgRetorno };
      }

      DAL.updateRow(SHEET.PROCESSOS, proc.rowIndex, row);
      logAction('EDITAR_PROCESSO', 'Processo ' + id + ' editado');

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
        observacoes:          r[COL_PROC.OBSERVACOES - 1],
        tipoServico:          r[COL_PROC.TIPO_SERVICO - 1] || '',
        par:                  r[COL_PROC.PAR - 1] || '',
        duracao:              r[COL_PROC.DURACAO_CONTRATO - 1] || ''
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
    formasContratacao:     FORMAS_CONTRATACAO,
    tiposServico:          TIPOS_SERVICO,
    opcoesPar:             OPCOES_PAR,
    opcoesDuracao:         OPCOES_DURACAO
  };
}

/**
 * Endpoint para preview de requisitos normativos (chamado do frontend).
 * @param {Object} params - { tipoServico, par, duracao, valorEstimado }
 * @returns {Object} Resultado da consulta à matriz
 */
function previewRequisitosNormativos(params) {
  var resultado = consultarMatrizNormativa(params);
  var flagNames = Object.keys(resultado.flags);
  var obrigatorios = [];
  var dispensaveis = [];

  for (var i = 0; i < flagNames.length; i++) {
    var shortKey = flagNames[i].replace('cadastramento','cad')
      .replace('credenciamento','cred').replace('mapaCotacao','mapa')
      .replace('proposta','prop').replace('compliance','comp')
      .replace('contrato','contr');
    var nome = NOMES_REQUISITOS[shortKey] || flagNames[i];

    if (resultado.flags[flagNames[i]]) {
      obrigatorios.push(nome);
    } else {
      dispensaveis.push(nome);
    }
  }

  return {
    secao: resultado.secao,
    faixaLabel: resultado.faixaLabel,
    found: resultado.found,
    obrigatorios: obrigatorios,
    dispensaveis: dispensaveis
  };
}


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 10: 05_Fornecedores █████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Gestão de Fornecedores
 * ============================================================
 * CRUD de fornecedores, validação CNPJ/CPF, tracking de
 * cadastro no Portal de Compras e credenciamento.
 * ============================================================
 */

/**
 * Cria um novo fornecedor.
 * Valida CNPJ/CPF e verifica duplicidade.
 * LOCKED.
 *
 * @param {Object} formData
 * @param {string} formData.cnpjCpf
 * @param {string} formData.razaoSocial
 * @param {string} formData.tipo - "Pessoa Juridica" ou "Pessoa Fisica"
 * @param {string} [formData.statusCadastro]
 * @param {Date}   [formData.validadeCadastro]
 * @param {string} [formData.statusCredenciamento]
 * @param {Date}   [formData.validadeCredenciamento]
 * @param {string} [formData.contato]
 * @param {string} [formData.email]
 * @param {string} [formData.telefone]
 * @param {string} [formData.dadosBancarios]
 * @param {string} [formData.observacoes]
 * @returns {{success: boolean, message: string, data: Object|null}}
 */
function criarFornecedor(formData) {
  try {
    return withDocumentLock(function() {
      // 1. Validar campos obrigatórios
      var validation = validateRequired(formData, ['cnpjCpf', 'razaoSocial', 'tipo']);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Campos obrigatorios: ' + validation.missing.join(', '),
          data: null
        };
      }

      // 2. Validar CNPJ/CPF
      var docLimpo = String(formData.cnpjCpf).replace(/[^\d]/g, '');
      if (!validateCNPJorCPF(docLimpo)) {
        return { success: false, message: 'CNPJ/CPF invalido.', data: null };
      }

      // 2b. SALVAGUARDA: validar tipo PJ/PF vs documento
      if (formData.tipo === 'Pessoa Juridica' && docLimpo.length !== 14) {
        return { success: false, message: 'Fornecedor PJ deve ter CNPJ (14 digitos).', data: null };
      }
      if (formData.tipo === 'Pessoa Fisica' && docLimpo.length !== 11) {
        return { success: false, message: 'Fornecedor PF deve ter CPF (11 digitos).', data: null };
      }

      // 2c. SALVAGUARDA: se vinculado a processo, validar compatibilidade
      if (formData.processoId) {
        var procRef = DAL.findRow(SHEET.PROCESSOS, COL_PROC.ID, formData.processoId);
        if (procRef) {
          var tipoServ = procRef.data[COL_PROC.TIPO_SERVICO - 1];
          var compat = validarFornecedorParaProcesso(tipoServ, formData.tipo);
          if (!compat.compatible) {
            return { success: false, message: compat.message, data: null };
          }
        }
      }

      // 3. Verificar duplicidade
      var existing = DAL.findRow(SHEET.FORNECEDORES, COL_FORN.CNPJ_CPF, docLimpo);
      if (existing) {
        return {
          success: false,
          message: 'Fornecedor com CNPJ/CPF ' + docLimpo + ' ja cadastrado.',
          data: null
        };
      }

      // 4. Montar linha
      var newRow = [
        docLimpo,
        normalizeString(formData.razaoSocial),
        formData.tipo,
        formData.statusCadastro || 'Pendente',
        formData.validadeCadastro || '',
        formData.statusCredenciamento || 'Pendente',
        formData.validadeCredenciamento || '',
        normalizeString(formData.contato || ''),
        normalizeString(formData.email || ''),
        normalizeString(formData.telefone || ''),
        normalizeString(formData.dadosBancarios || ''),
        normalizeString(formData.observacoes || '')
      ];

      DAL.appendRow(SHEET.FORNECEDORES, newRow);

      logAction('CRIAR_FORNECEDOR', 'Fornecedor ' + formData.razaoSocial
                + ' (' + docLimpo + ') cadastrado');

      return {
        success: true,
        message: 'Fornecedor cadastrado com sucesso.',
        data: { cnpjCpf: docLimpo }
      };
    }, 'criarFornecedor');
  } catch (e) {
    return { success: false, message: e.message, data: null };
  }
}

/**
 * Consulta fornecedores com filtros opcionais.
 * SEM lock (leitura).
 *
 * @param {Object} [filters]
 * @param {string} [filters.tipo]
 * @param {string} [filters.statusCadastro]
 * @param {string} [filters.statusCredenciamento]
 * @param {string} [filters.busca] - Busca textual (razão social, CNPJ/CPF)
 * @returns {{success: boolean, data: Array<Object>, message: string}}
 */
function consultarFornecedores(filters) {
  try {
    filters = filters || {};
    var allRows = DAL.readAll(SHEET.FORNECEDORES);
    var results = [];

    for (var i = 0; i < allRows.length; i++) {
      var row = allRows[i];

      if (filters.tipo && row[COL_FORN.TIPO - 1] !== filters.tipo) continue;
      if (filters.statusCadastro && row[COL_FORN.STATUS_CADASTRO - 1] !== filters.statusCadastro) continue;
      if (filters.statusCredenciamento && row[COL_FORN.STATUS_CREDENCIAMENTO - 1] !== filters.statusCredenciamento) continue;

      if (filters.busca) {
        var termo = String(filters.busca).toLowerCase();
        var campos = [
          String(row[COL_FORN.CNPJ_CPF - 1]),
          String(row[COL_FORN.RAZAO_SOCIAL - 1])
        ].join(' ').toLowerCase();
        if (campos.indexOf(termo) === -1) continue;
      }

      results.push({
        cnpjCpf:                row[COL_FORN.CNPJ_CPF - 1],
        razaoSocial:            row[COL_FORN.RAZAO_SOCIAL - 1],
        tipo:                   row[COL_FORN.TIPO - 1],
        statusCadastro:         row[COL_FORN.STATUS_CADASTRO - 1],
        validadeCadastro:       row[COL_FORN.VALIDADE_CADASTRO - 1] instanceof Date
                                  ? formatDateBR(row[COL_FORN.VALIDADE_CADASTRO - 1]) : '',
        statusCredenciamento:   row[COL_FORN.STATUS_CREDENCIAMENTO - 1],
        validadeCredenciamento: row[COL_FORN.VALIDADE_CREDENCIAMENTO - 1] instanceof Date
                                  ? formatDateBR(row[COL_FORN.VALIDADE_CREDENCIAMENTO - 1]) : '',
        contato:                row[COL_FORN.CONTATO - 1],
        email:                  row[COL_FORN.EMAIL - 1],
        telefone:               row[COL_FORN.TELEFONE - 1],
        dadosBancarios:         row[COL_FORN.DADOS_BANCARIOS - 1],
        observacoes:            row[COL_FORN.OBSERVACOES - 1]
      });
    }

    return {
      success: true,
      data: results,
      message: results.length + ' fornecedor(es) encontrado(s).'
    };
  } catch (e) {
    return { success: false, data: [], message: 'Erro: ' + e.message };
  }
}

/**
 * Retorna um fornecedor por CNPJ/CPF.
 * SEM lock.
 *
 * @param {string} cnpjCpf
 * @returns {{success: boolean, data: Object|null, message: string}}
 */
function consultarFornecedorPorCnpj(cnpjCpf) {
  try {
    var docLimpo = String(cnpjCpf).replace(/[^\d]/g, '');
    var result = consultarFornecedores({ busca: docLimpo });
    var forn = result.data.find(function(f) { return String(f.cnpjCpf) === docLimpo; });
    if (!forn) {
      return { success: false, data: null, message: 'Fornecedor nao encontrado.' };
    }
    return { success: true, data: forn, message: 'Fornecedor encontrado.' };
  } catch (e) {
    return { success: false, data: null, message: 'Erro: ' + e.message };
  }
}

/**
 * Edita campos de um fornecedor existente.
 * LOCKED.
 *
 * @param {string} cnpjCpf
 * @param {Object} formData - Campos a atualizar
 * @returns {{success: boolean, message: string}}
 */
function editarFornecedor(cnpjCpf, formData) {
  try {
    return withDocumentLock(function() {
      var docLimpo = String(cnpjCpf).replace(/[^\d]/g, '');
      var forn = DAL.findRow(SHEET.FORNECEDORES, COL_FORN.CNPJ_CPF, docLimpo);
      if (!forn) {
        return { success: false, message: 'Fornecedor nao encontrado.' };
      }

      var row = forn.data;

      if (formData.razaoSocial !== undefined) {
        row[COL_FORN.RAZAO_SOCIAL - 1] = normalizeString(formData.razaoSocial);
      }
      if (formData.tipo !== undefined) {
        row[COL_FORN.TIPO - 1] = formData.tipo;
      }
      if (formData.contato !== undefined) {
        row[COL_FORN.CONTATO - 1] = normalizeString(formData.contato);
      }
      if (formData.email !== undefined) {
        row[COL_FORN.EMAIL - 1] = normalizeString(formData.email);
      }
      if (formData.telefone !== undefined) {
        row[COL_FORN.TELEFONE - 1] = normalizeString(formData.telefone);
      }
      if (formData.dadosBancarios !== undefined) {
        row[COL_FORN.DADOS_BANCARIOS - 1] = normalizeString(formData.dadosBancarios);
      }
      if (formData.observacoes !== undefined) {
        row[COL_FORN.OBSERVACOES - 1] = normalizeString(formData.observacoes);
      }

      DAL.updateRow(SHEET.FORNECEDORES, forn.rowIndex, row);
      logAction('EDITAR_FORNECEDOR', 'Fornecedor ' + row[COL_FORN.RAZAO_SOCIAL - 1]
                + ' (' + docLimpo + ') editado');

      return { success: true, message: 'Fornecedor atualizado.' };
    }, 'editarFornecedor');
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Atualiza status e validade de cadastro no Portal de Compras.
 * LOCKED.
 *
 * @param {string} cnpjCpf
 * @param {string} status - Ex: "Ativo", "Pendente", "Vencido"
 * @param {Date|string} validade
 * @returns {{success: boolean, message: string}}
 */
function atualizarStatusPortal(cnpjCpf, status, validade) {
  try {
    return withDocumentLock(function() {
      var docLimpo = String(cnpjCpf).replace(/[^\d]/g, '');
      var forn = DAL.findRow(SHEET.FORNECEDORES, COL_FORN.CNPJ_CPF, docLimpo);
      if (!forn) {
        return { success: false, message: 'Fornecedor nao encontrado.' };
      }

      forn.data[COL_FORN.STATUS_CADASTRO - 1]  = status;
      forn.data[COL_FORN.VALIDADE_CADASTRO - 1] = validade || '';

      DAL.updateRow(SHEET.FORNECEDORES, forn.rowIndex, forn.data);
      logAction('ATUALIZAR_PORTAL', docLimpo + ' - Portal: ' + status);

      return { success: true, message: 'Status do portal atualizado.' };
    }, 'atualizarStatusPortal');
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Atualiza status e validade de credenciamento.
 * LOCKED.
 *
 * @param {string} cnpjCpf
 * @param {string} status - Ex: "Ativo", "Pendente", "Vencido"
 * @param {Date|string} validade
 * @returns {{success: boolean, message: string}}
 */
function atualizarCredenciamento(cnpjCpf, status, validade) {
  try {
    return withDocumentLock(function() {
      var docLimpo = String(cnpjCpf).replace(/[^\d]/g, '');
      var forn = DAL.findRow(SHEET.FORNECEDORES, COL_FORN.CNPJ_CPF, docLimpo);
      if (!forn) {
        return { success: false, message: 'Fornecedor nao encontrado.' };
      }

      forn.data[COL_FORN.STATUS_CREDENCIAMENTO - 1]   = status;
      forn.data[COL_FORN.VALIDADE_CREDENCIAMENTO - 1]  = validade || '';

      DAL.updateRow(SHEET.FORNECEDORES, forn.rowIndex, forn.data);
      logAction('ATUALIZAR_CREDENCIAMENTO', docLimpo + ' - Credenciamento: ' + status);

      return { success: true, message: 'Credenciamento atualizado.' };
    }, 'atualizarCredenciamento');
  } catch (e) {
    return { success: false, message: e.message };
  }
}


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 11: 08_Dashboard ████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Dashboard
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


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 12: 09_Alertas ██████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Sistema de Alertas
 * ============================================================
 * Avaliação de condições de alerta, envio de emails,
 * gerenciamento de triggers (diário, semanal, dashboard).
 * ============================================================
 */

// ── Gerenciamento de Triggers ───────────────────────────────

/**
 * Instala os triggers de tempo (diário, semanal, dashboard).
 * Idempotente: remove triggers existentes antes de criar.
 * Deve ser executado pelo owner da planilha.
 */
function installTriggers() {
  removeTriggers();

  // Alertas diários às 8h (Brasília)
  ScriptApp.newTrigger('executarAlertasDiarios')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .inTimezone('America/Sao_Paulo')
    .create();

  // Relatório semanal — segunda às 9h
  ScriptApp.newTrigger('executarRelatorioSemanal')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .inTimezone('America/Sao_Paulo')
    .create();

  // Refresh do dashboard a cada 4h
  ScriptApp.newTrigger('refreshDashboard')
    .timeBased()
    .everyHours(4)
    .create();

  logAction('TRIGGERS', 'Triggers instalados com sucesso');
}

/**
 * Remove todos os triggers do projeto.
 */
function removeTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}

// ── Alertas Diários ─────────────────────────────────────────

/**
 * Avalia todas as condições de alerta e envia email consolidado.
 * Executado via trigger diário às 8h.
 *
 * Condições:
 * 1. Etapa vencida (prazo ultrapassado)
 * 2. Próximo vencimento (dentro de X dias)
 * 3. Processo parado (sem movimentação há X dias)
 * 4. Credenciamento de fornecedor vencendo (dentro de X dias)
 */
function executarAlertasDiarios() {
  try {
    var hoje = new Date();
    var thresholds = getAlertThresholds_();
    var alerts = [];

    // ── Alertas de Processos/Etapas ───────────────────────
    var processos = DAL.readAll(SHEET.PROCESSOS);
    var etapas = DAL.readAll(SHEET.ETAPAS);

    for (var i = 0; i < processos.length; i++) {
      var proc = processos[i];
      var id = proc[COL_PROC.ID - 1];
      var status = proc[COL_PROC.STATUS_GERAL - 1];

      if (status !== STATUS.EM_ANDAMENTO) continue;

      // Encontrar etapas ativas deste processo
      for (var j = 0; j < etapas.length; j++) {
        var etapa = etapas[j];
        if (String(etapa[COL_ETAPA.ID_PROCESSO - 1]) !== String(id)) continue;
        if (etapa[COL_ETAPA.STATUS - 1] !== STATUS.EM_ANDAMENTO) continue;

        var prazoLimite = etapa[COL_ETAPA.PRAZO_LIMITE - 1];
        if (prazoLimite instanceof Date) {
          var diasAte = diffDays(prazoLimite, hoje);

          if (diasAte < 0) {
            alerts.push({
              type: 'VENCIDO',
              processo: id,
              etapa: etapa[COL_ETAPA.NUM - 1] + '. ' + etapa[COL_ETAPA.ETAPA - 1],
              detail: 'Atrasado em ' + Math.abs(diasAte) + ' dia(s)',
              responsible: etapa[COL_ETAPA.RESPONSAVEL - 1]
            });
          } else if (diasAte <= thresholds.overdueWarningDays) {
            alerts.push({
              type: 'PROXIMO_VENCIMENTO',
              processo: id,
              etapa: etapa[COL_ETAPA.NUM - 1] + '. ' + etapa[COL_ETAPA.ETAPA - 1],
              detail: 'Vence em ' + diasAte + ' dia(s)',
              responsible: etapa[COL_ETAPA.RESPONSAVEL - 1]
            });
          }
        }
      }

      // Processo parado
      var lastTransition = getLastTransitionDate_(id, etapas);
      if (lastTransition) {
        var diasParado = diffDays(hoje, lastTransition);
        if (diasParado >= thresholds.staleDays) {
          alerts.push({
            type: 'PROCESSO_PARADO',
            processo: id,
            etapa: proc[COL_PROC.ETAPA_ATUAL - 1],
            detail: 'Sem movimentacao ha ' + diasParado + ' dia(s)',
            responsible: 'DINT'
          });
        }
      }
    }

    // ── Alertas de Fornecedores ───────────────────────────
    var fornecedores = DAL.readAll(SHEET.FORNECEDORES);

    for (var k = 0; k < fornecedores.length; k++) {
      var forn = fornecedores[k];
      var valCred = forn[COL_FORN.VALIDADE_CREDENCIAMENTO - 1];

      if (valCred instanceof Date) {
        var diasCredencial = diffDays(valCred, hoje);
        if (diasCredencial > 0 && diasCredencial <= thresholds.credentialWarningDays) {
          alerts.push({
            type: 'CREDENCIAMENTO_VENCENDO',
            processo: '',
            etapa: '',
            detail: forn[COL_FORN.RAZAO_SOCIAL - 1] + ' - credenciamento vence em '
                    + diasCredencial + ' dia(s)',
            responsible: 'DINT'
          });
        } else if (diasCredencial <= 0) {
          alerts.push({
            type: 'CREDENCIAMENTO_VENCIDO',
            processo: '',
            etapa: '',
            detail: forn[COL_FORN.RAZAO_SOCIAL - 1] + ' - credenciamento VENCIDO ha '
                    + Math.abs(diasCredencial) + ' dia(s)',
            responsible: 'DINT'
          });
        }
      }
    }

    // ── Enviar email e atualizar colunas ──────────────────
    if (alerts.length > 0) {
      enviarEmailAlertas_(alerts);

      // Atualizar coluna Alertas nos processos
      withDocumentLock(function() {
        atualizarColunasAlerta_(processos, alerts);
      }, 'atualizarAlertasDiarios');
    }

    logAction('ALERTAS_DIARIOS', alerts.length + ' alerta(s) identificado(s)');
  } catch (e) {
    logAction('ERRO_ALERTAS', 'Falha nos alertas diarios: ' + e.message);
  }
}

// ── Relatório Semanal ───────────────────────────────────────

/**
 * Gera e envia relatório semanal por email.
 * Executado via trigger semanal (segunda 9h).
 */
function executarRelatorioSemanal() {
  try {
    var kpis = computeKPIs();
    var hoje = new Date();

    var html = '<h2>Workflow DINT - Relatorio Semanal</h2>'
      + '<p><strong>Data:</strong> ' + formatDateBR(hoje) + '</p>'
      + '<hr>'
      + '<h3>Resumo Geral</h3>'
      + '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">'
      + '<tr><th>Indicador</th><th>Valor</th></tr>'
      + '<tr><td>Total de Processos</td><td>' + kpis.totalProcessos + '</td></tr>'
      + '<tr><td>Em Andamento</td><td>' + kpis.emAndamento + '</td></tr>'
      + '<tr><td>Concluidos</td><td>' + kpis.concluidos + '</td></tr>'
      + '<tr><td>Cancelados</td><td>' + kpis.cancelados + '</td></tr>'
      + '<tr><td>Suspensos</td><td>' + kpis.suspensos + '</td></tr>'
      + '<tr><td>Media Dias em Aberto</td><td>' + kpis.mediadiasAberto + '</td></tr>'
      + '<tr><td>Valor Total Estimado</td><td>' + formatCurrency(kpis.valorTotal) + '</td></tr>'
      + '</table>';

    // Tabela por tipo
    var tipos = Object.keys(kpis.porTipo);
    if (tipos.length > 0) {
      html += '<h3>Por Tipo de Contratacao</h3>'
        + '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">'
        + '<tr><th>Tipo</th><th>Qtd</th></tr>';
      for (var t = 0; t < tipos.length; t++) {
        html += '<tr><td>' + tipos[t] + '</td><td>' + kpis.porTipo[tipos[t]] + '</td></tr>';
      }
      html += '</table>';
    }

    html += '<hr><p style="color:#888;font-size:11px;">Workflow DINT / FGV v2.0 - Relatorio automatico</p>';

    var recipients = getAlertRecipients_();
    MailApp.sendEmail({
      to: recipients,
      subject: 'Workflow DINT - Relatorio Semanal - ' + formatDateBR(hoje),
      htmlBody: html
    });

    logAction('RELATORIO_SEMANAL', 'Enviado para ' + recipients);
  } catch (e) {
    logAction('ERRO_RELATORIO', 'Falha no relatorio semanal: ' + e.message);
  }
}

// ── Consultas de Alertas (para UI) ──────────────────────────

/**
 * Retorna alertas ativos para exibição no painel.
 * SEM lock.
 *
 * @returns {{success: boolean, data: Array<Object>, message: string}}
 */
function getAlertasAtivos() {
  try {
    var hoje = new Date();
    var thresholds = getAlertThresholds_();
    var alerts = [];

    var processos = DAL.readAll(SHEET.PROCESSOS);
    for (var i = 0; i < processos.length; i++) {
      var alertText = processos[i][COL_PROC.ALERTAS - 1];
      if (alertText) {
        alerts.push({
          processo: processos[i][COL_PROC.ID - 1],
          descricao: processos[i][COL_PROC.DESCRICAO - 1],
          alerta: alertText,
          etapaAtual: processos[i][COL_PROC.ETAPA_ATUAL - 1]
        });
      }
    }

    return {
      success: true,
      data: alerts,
      message: alerts.length + ' alerta(s) ativo(s).'
    };
  } catch (e) {
    return { success: false, data: [], message: 'Erro: ' + e.message };
  }
}

/**
 * Retorna configuração de alertas.
 * @returns {Object}
 */
function getConfigAlertas() {
  return {
    recipients: getAlertRecipients_(),
    thresholds: getAlertThresholds_()
  };
}

/**
 * Salva configuração de alertas.
 * @param {Object} config
 * @param {string} config.recipients - emails separados por vírgula
 * @param {Object} config.thresholds
 * @returns {{success: boolean, message: string}}
 */
function salvarConfigAlertas(config) {
  try {
    if (config.recipients) {
      setScriptConfig('ALERT_RECIPIENTS', config.recipients);
    }
    if (config.thresholds) {
      setScriptConfig('ALERT_THRESHOLDS', JSON.stringify(config.thresholds));
    }
    logAction('CONFIG_ALERTAS', 'Configuracao de alertas atualizada');
    return { success: true, message: 'Configuracao salva.' };
  } catch (e) {
    return { success: false, message: 'Erro: ' + e.message };
  }
}

// ── Helpers internos ────────────────────────────────────────

/**
 * Retorna lista de destinatários de alerta.
 * @returns {string}
 */
function getAlertRecipients_() {
  return getScriptConfig('ALERT_RECIPIENTS') || '';
}

/**
 * Retorna thresholds de alerta.
 * @returns {Object}
 */
function getAlertThresholds_() {
  var prop = getScriptConfig('ALERT_THRESHOLDS');
  if (prop) {
    try { return JSON.parse(prop); } catch (e) { /* fallback */ }
  }
  return {
    overdueWarningDays:     ALERT_DEFAULTS.OVERDUE_WARNING_DAYS,
    staleDays:              ALERT_DEFAULTS.STALE_DAYS,
    credentialWarningDays:  ALERT_DEFAULTS.CREDENTIAL_WARNING_DAYS
  };
}

/**
 * Envia email consolidado com alertas.
 * @param {Array<Object>} alerts
 */
function enviarEmailAlertas_(alerts) {
  var recipients = getAlertRecipients_();
  if (!recipients) return;

  var hoje = formatDateBR(new Date());
  var html = '<h2>Workflow DINT - Alertas Diarios</h2>'
    + '<p><strong>Data:</strong> ' + hoje + '</p>'
    + '<p><strong>' + alerts.length + ' alerta(s) identificado(s)</strong></p>'
    + '<hr>'
    + '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">'
    + '<tr style="background:#f0f0f0;"><th>Tipo</th><th>Processo</th><th>Etapa</th><th>Detalhe</th><th>Responsavel</th></tr>';

  for (var i = 0; i < alerts.length; i++) {
    var a = alerts[i];
    var bgColor = a.type === 'VENCIDO' || a.type === 'CREDENCIAMENTO_VENCIDO' ? '#ffe0e0' : '#fff3cd';
    html += '<tr style="background:' + bgColor + ';">'
      + '<td>' + a.type + '</td>'
      + '<td>' + a.processo + '</td>'
      + '<td>' + a.etapa + '</td>'
      + '<td>' + a.detail + '</td>'
      + '<td>' + a.responsible + '</td>'
      + '</tr>';
  }

  html += '</table>'
    + '<hr><p style="color:#888;font-size:11px;">Workflow DINT / FGV v2.0 - Alerta automatico</p>';

  MailApp.sendEmail({
    to: recipients,
    subject: 'Workflow DINT - ' + alerts.length + ' Alerta(s) - ' + hoje,
    htmlBody: html
  });
}

/**
 * Atualiza a coluna Alertas nos processos com base nos alertas identificados.
 * DEVE ser chamada dentro de withDocumentLock().
 *
 * @param {Array<Array<any>>} processos - Dados atuais de Processos
 * @param {Array<Object>} alerts - Alertas identificados
 */
function atualizarColunasAlerta_(processos, alerts) {
  // Agrupar alertas por processo
  var alertsPorProcesso = {};
  for (var i = 0; i < alerts.length; i++) {
    var a = alerts[i];
    if (a.processo) {
      if (!alertsPorProcesso[a.processo]) {
        alertsPorProcesso[a.processo] = [];
      }
      alertsPorProcesso[a.processo].push(a.type + ': ' + a.detail);
    }
  }

  // Atualizar coluna Alertas
  for (var j = 0; j < processos.length; j++) {
    var procId = processos[j][COL_PROC.ID - 1];
    var alertTexts = alertsPorProcesso[procId];
    var newAlertValue = alertTexts ? alertTexts.join(' | ') : '';

    // Só atualizar se mudou
    if (String(processos[j][COL_PROC.ALERTAS - 1]) !== newAlertValue) {
      DAL.updateCell(SHEET.PROCESSOS, j + 2, COL_PROC.ALERTAS, newAlertValue);
    }
  }
}


// ████████████████████████████████████████████████████████████████████████████
// █ SECAO 13: 01_Main █████████████████████████████████████████████████
// ████████████████████████████████████████████████████████████████████████████

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
  var html = createTemplateFromEmbedded_('Sidebar_Main')
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
  return createTemplateFromEmbedded_('Panel_Processos').getContent();
}

/**
 * Retorna HTML do painel de fornecedores.
 * @returns {string}
 */
function getPanelFornecedores() {
  return createTemplateFromEmbedded_('Panel_Fornecedores').getContent();
}

/**
 * Retorna HTML do painel de etapas.
 * @returns {string}
 */
function getPanelEtapas() {
  return createTemplateFromEmbedded_('Panel_Etapas').getContent();
}

/**
 * Retorna HTML do painel do dashboard.
 * @returns {string}
 */
function getPanelDashboard() {
  return createTemplateFromEmbedded_('Panel_Dashboard').getContent();
}

/**
 * Retorna HTML do painel de alertas.
 * @returns {string}
 */
function getPanelAlertas() {
  return createTemplateFromEmbedded_('Panel_Alertas').getContent();
}

/**
 * Retorna HTML do painel de configuração.
 * @returns {string}
 */
function getPanelConfig() {
  return createTemplateFromEmbedded_('Panel_Config').getContent();
}

