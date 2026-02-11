/**
 * ============================================================
 * WORKFLOW ADM DINT 2.0 — Configuracao Central
 * ============================================================
 */

// ── Nomes das abas ──────────────────────────────────────────
var SHEET = {
  HOME:          'HOME',
  AQUISICOES:    'Aquisicoes',
  FORNECEDORES:  'Fornecedores',
  ETAPAS:        'Etapas',
  DASHBOARD:     'Dashboard',
  LOG:           'Log'
};

// ── Colunas da aba Aquisicoes (1-based) ─────────────────────
var COL_AQUIS = {
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
  ALERTAS:               24
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
  ID_AQUISICAO:    1,
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

// ── Status possiveis ────────────────────────────────────────
var STATUS = {
  EM_ANDAMENTO:   'Em Andamento',
  CONCLUIDO:      'Concluido',
  CANCELADO:      'Cancelado',
  SUSPENSO:       'Suspenso',
  PENDENTE:       'Pendente',
  NAO_APLICAVEL:  'N/A'
};

// ── 23 etapas do ciclo de contratacao ───────────────────────
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

var FLAG_TO_STAGE = {
  coletaPrecos: [6], proposta: [8], credenciamento: [4], compliance: [5], contrato: [9, 10]
};

var TIPOS_CONTRATACAO = ['Compra Direta', 'Licitacao', 'Dispensa de Licitacao', 'Inexigibilidade'];
var NATUREZAS_TERCEIRO = ['Pessoa Juridica', 'Pessoa Fisica', 'Organismo Internacional'];
var NATUREZAS_CONTRATACAO = ['Servico', 'Material', 'Obra', 'Consultoria', 'Locacao'];
var FORMAS_CONTRATACAO = ['Contrato', 'Ordem de Servico', 'Nota de Empenho', 'Carta Acordo'];

var CONFIG_LOCK = { TIMEOUT_MS: 30000, RETRY_COUNT: 3, RETRY_BASE_MS: 1000 };
var THRESHOLDS = { COLETA_PRECOS_VALOR: 17600, PROPOSTA_VALOR: 50000, COMPLIANCE_VALOR: 50000, CONTRATO_VALOR: 100000 };
var ALERT_DEFAULTS = { OVERDUE_WARNING_DAYS: 3, STALE_DAYS: 15, CREDENTIAL_WARNING_DAYS: 30 };
var NORMATIVES = ['NP AC.03.004', 'NP AC.03.006', 'NP AC.03.002', 'NP AF.03.003', 'Portaria 24/2024'];
