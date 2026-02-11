/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Gestão de Fornecedores
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
