/**
 * ============================================================
 * WORKFLOW DINT / FGV v2.0 — Utilitários
 * ============================================================
 * Validações, formatação, include() para HTML,
 * helpers de PropertiesService.
 * ============================================================
 */

// ── HTML Template Include ───────────────────────────────────

/**
 * Inclui o conteúdo de um arquivo HTML em um template.
 * Uso em HTML: <?!= include('Sidebar_CSS') ?>
 * @param {string} filename - Nome do arquivo (sem .html)
 * @returns {string}
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

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
