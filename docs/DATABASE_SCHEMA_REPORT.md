# Relatório de Estrutura do Banco de Dados
## Conselho IA de Geopolítica da FGV

**Data de Geração:** Janeiro de 2026
**Sistema:** PostgreSQL (Supabase)
**ORM:** Drizzle ORM

---

## Índice

1. [Enumerações (Enums)](#1-enumerações-enums)
2. [Tabelas do Sistema](#2-tabelas-do-sistema)
   - 2.1 [users](#21-users---usuários)
   - 2.2 [invited_users](#22-invited_users---usuários-convidados)
   - 2.3 [analyses](#23-analyses---análises)
   - 2.4 [analysis_sources](#24-analysis_sources---fontes-de-análise)
   - 2.5 [analysis_templates](#25-analysis_templates---templates-de-análise)
   - 2.6 [payments](#26-payments---pagamentos)
   - 2.7 [counselors](#27-counselors---conselheiros)
   - 2.8 [counselor_llm_config](#28-counselor_llm_config---configuração-llm-dos-conselheiros)
   - 2.9 [counselor_opinions](#29-counselor_opinions---pareceres-dos-conselheiros)
   - 2.10 [llm_usage_costs](#210-llm_usage_costs---custos-de-uso-llm)
   - 2.11 [llm_pricing](#211-llm_pricing---preços-dos-modelos-llm)
   - 2.12 [system_prompts](#212-system_prompts---prompts-do-sistema)
   - 2.13 [email_config](#213-email_config---configuração-de-emails)
   - 2.14 [temperature_config](#214-temperature_config---configuração-de-temperatura)
   - 2.15 [system_parameters](#215-system_parameters---parâmetros-do-sistema)
3. [Relacionamentos entre Tabelas](#3-relacionamentos-entre-tabelas)

---

## 1. Enumerações (Enums)

### user_role
Define os tipos de usuário no sistema.
| Valor | Descrição |
|-------|-----------|
| `pesquisador` | Usuário padrão com acesso básico |
| `diretor` | Acesso intermediário com permissões de direção |
| `administrador` | Acesso total ao sistema |

### analysis_status
Estados possíveis de uma análise.
| Valor | Descrição |
|-------|-----------|
| `draft` | Rascunho, ainda não iniciada |
| `processing` | Em processamento pelos agentes |
| `completed` | Análise concluída com sucesso |
| `failed` | Falha no processamento |
| `timeout` | Tempo limite excedido |
| `cancelled` | Cancelada pelo usuário |

### source_type
Tipos de fontes para análise.
| Valor | Descrição |
|-------|-----------|
| `file` | Arquivo enviado (PDF, DOC, etc.) |
| `news` | Notícia de API de notícias |
| `web` | Conteúdo extraído da web |

### template_type
Tipos de templates salvos.
| Valor | Descrição |
|-------|-----------|
| `analysis` | Template de estrutura de análise |
| `report` | Template de estrutura de relatório |

### payment_status
Estados de pagamento.
| Valor | Descrição |
|-------|-----------|
| `pending` | Aguardando pagamento |
| `completed` | Pagamento concluído |
| `failed` | Pagamento falhou |
| `refunded` | Reembolsado |

### prompt_category
Categorias de prompts do sistema.
| Valor | Descrição |
|-------|-----------|
| `agent` | Prompt para agente (conselheiro) |
| `task` | Prompt para tarefa específica |
| `evaluation` | Prompt de avaliação |

### opinion_status
Estados do parecer do conselheiro.
| Valor | Descrição |
|-------|-----------|
| `pending` | Aguardando revisão |
| `approved` | Aprovado pelo GennovAIs |
| `rejected` | Rejeitado |
| `revision_requested` | Revisão solicitada |

### parameter_type
Tipos de parâmetros do sistema.
| Valor | Descrição |
|-------|-----------|
| `number` | Valor numérico |
| `boolean` | Verdadeiro/Falso |
| `string` | Texto |

---

## 2. Tabelas do Sistema

### 2.1 users - Usuários

Armazena os usuários registrados no sistema.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `openId` | VARCHAR(64) | Sim, Único | ID externo do usuário (OAuth ou email-based) |
| `name` | TEXT | Não | Nome completo |
| `email` | VARCHAR(320) | Não | Email do usuário |
| `loginMethod` | VARCHAR(64) | Não | Método de login (google, email, etc.) |
| `role` | user_role | Sim | Papel do usuário (default: pesquisador) |
| `validUntil` | TIMESTAMP | Não | Data de validade do acesso |
| `isActive` | BOOLEAN | Sim | Se o usuário está ativo (default: true) |
| `analysisQuota` | INTEGER | Sim | Quota de análises gratuitas (default: 5) |
| `analysisUsed` | INTEGER | Sim | Análises já utilizadas (default: 0) |
| `totalSpent` | NUMERIC(10,2) | Sim | Total gasto em análises extras |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |
| `lastSignedIn` | TIMESTAMP | Sim | Último login |

---

### 2.2 invited_users - Usuários Convidados

Emails pré-cadastrados pelo administrador antes do primeiro acesso.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `name` | TEXT | Não | Nome do convidado |
| `email` | VARCHAR(320) | Sim, Único | Email do convidado |
| `validUntil` | TIMESTAMP | Não | Data limite para aceitar convite |
| `isActive` | BOOLEAN | Sim | Se o convite está ativo |
| `analysisQuota` | INTEGER | Sim | Quota atribuída pelo admin |
| `role` | user_role | Sim | Papel atribuído |
| `invitedBy` | INTEGER | Sim | ID do admin que convidou |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

**Relacionamentos:**
- `invitedBy` → `users.id`

---

### 2.3 analyses - Análises

Registros principais de análises geopolíticas.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `userId` | INTEGER | Sim | Usuário que criou a análise |
| `sessionCode` | VARCHAR(50) | Único | Código único da sessão (ex: FGV-GEO-2025-0042) |
| `title` | VARCHAR(500) | Sim | Título da análise |
| `objective` | TEXT | Sim | Objetivo da análise |
| `context` | TEXT | Não | Contexto adicional |
| `status` | analysis_status | Sim | Estado atual (default: draft) |
| `selectedAnalysts` | JSONB | Não | Array de IDs dos conselheiros selecionados |
| `analysisSteps` | JSONB | Não | Etapas de progresso com timing |
| `analysisStructure` | JSONB | Não | Estrutura da análise gerada |
| `reportStructure` | JSONB | Não | Estrutura do relatório |
| `generatedContent` | TEXT | Não | Conteúdo final gerado |
| `estimatedCost` | NUMERIC(10,4) | Não | Custo estimado em USD |
| `actualCost` | NUMERIC(10,4) | Não | Custo real em USD |
| `totalTokensUsed` | INTEGER | Não | Total de tokens utilizados |
| `executionTime` | INTEGER | Não | Tempo de execução em ms |
| `savedToHistory` | BOOLEAN | Sim | Se foi salvo no histórico |
| `isPaid` | BOOLEAN | Sim | Se foi pago (análise extra) |
| `isArchived` | BOOLEAN | Sim | Se está arquivado |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |
| `completedAt` | TIMESTAMP | Não | Data de conclusão |

**Relacionamentos:**
- `userId` → `users.id`

---

### 2.4 analysis_sources - Fontes de Análise

Fontes utilizadas em cada análise (arquivos, notícias, web).

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `analysisId` | INTEGER | Sim | Análise relacionada |
| `sourceType` | source_type | Sim | Tipo de fonte |
| `title` | VARCHAR(500) | Não | Título da fonte |
| `url` | TEXT | Não | URL da fonte |
| `fileKey` | VARCHAR(500) | Não | Chave do arquivo no storage |
| `fileName` | VARCHAR(255) | Não | Nome do arquivo |
| `mimeType` | VARCHAR(100) | Não | Tipo MIME do arquivo |
| `extractedText` | TEXT | Não | Texto extraído da fonte |
| `metadata` | JSONB | Não | Metadados adicionais |
| `createdAt` | TIMESTAMP | Sim | Data de criação |

**Relacionamentos:**
- `analysisId` → `analyses.id`

---

### 2.5 analysis_templates - Templates de Análise

Templates salvos para reutilização.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `userId` | INTEGER | Sim | Usuário proprietário |
| `name` | VARCHAR(255) | Sim | Nome do template |
| `description` | TEXT | Não | Descrição |
| `templateType` | template_type | Sim | Tipo (analysis/report) |
| `structure` | JSONB | Sim | Estrutura JSON do template |
| `isDefault` | BOOLEAN | Sim | Se é template padrão |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

**Relacionamentos:**
- `userId` → `users.id`

---

### 2.6 payments - Pagamentos

Registros de pagamentos por análises extras.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `userId` | INTEGER | Sim | Usuário que pagou |
| `analysisId` | INTEGER | Não | Análise relacionada |
| `amount` | NUMERIC(10,2) | Sim | Valor do pagamento |
| `currency` | VARCHAR(3) | Sim | Moeda (default: USD) |
| `status` | payment_status | Sim | Estado do pagamento |
| `paymentMethod` | VARCHAR(50) | Não | Método de pagamento |
| `transactionId` | VARCHAR(255) | Não | ID da transação |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

**Relacionamentos:**
- `userId` → `users.id`
- `analysisId` → `analyses.id`

---

### 2.7 counselors - Conselheiros

Perfil completo de cada conselheiro/analista.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `counselorId` | VARCHAR(50) | Sim, Único | ID único do conselheiro |
| `name` | VARCHAR(200) | Sim | Nome completo |
| `shortName` | VARCHAR(100) | Não | Nome curto para exibição |
| `nationality` | VARCHAR(100) | Não | Nacionalidade |
| `birthYear` | INTEGER | Não | Ano de nascimento |
| `deathYear` | INTEGER | Não | Ano de falecimento |
| `photoUrl` | TEXT | Não | URL da foto (legado) |
| `homePhotoUrl` | TEXT | Não | Foto da galeria inicial |
| `bioPhotoUrl` | TEXT | Não | Foto da página de biografia |
| `shortBio` | TEXT | Não | Biografia curta |
| `fullBio` | TEXT | Não | Biografia completa |
| `mainTheory` | VARCHAR(200) | Não | Teoria principal |
| `keyContributions` | JSONB | Não | Array de contribuições |
| `areasOfExpertise` | JSONB | Não | Array de áreas de expertise |
| `mainBooks` | JSONB | Não | Array de livros principais |
| `articles` | JSONB | Não | Array de artigos |
| `otherMaterials` | JSONB | Não | Array de outros materiais |
| `personalityTraits` | JSONB | Não | Traços de personalidade |
| `writingStyle` | TEXT | Não | Estilo de escrita |
| `analysisApproach` | TEXT | Não | Abordagem de análise |
| `keyPhrases` | JSONB | Não | Frases características |
| `llmProvider` | VARCHAR(50) | Não | Provedor LLM (default: gemini) |
| `llmModel` | VARCHAR(100) | Não | Modelo LLM |
| `isActive` | BOOLEAN | Sim | Se está ativo |
| `unavailabilityText` | VARCHAR(100) | Não | Texto de indisponibilidade |
| `isBuiltIn` | BOOLEAN | Sim | Se é conselheiro padrão |
| `displayOrder` | INTEGER | Sim | Ordem de exibição |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

---

### 2.8 counselor_llm_config - Configuração LLM dos Conselheiros

Configurações específicas de LLM por conselheiro.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `counselorId` | VARCHAR(50) | Sim, Único | ID do conselheiro |
| `counselorName` | VARCHAR(100) | Sim | Nome do conselheiro |
| `llmProvider` | VARCHAR(50) | Sim | Provedor (gemini, openai, anthropic) |
| `llmModel` | VARCHAR(100) | Sim | Nome do modelo |
| `personality` | TEXT | Não | Descrição de personalidade |
| `endpoint` | TEXT | Não | Endpoint customizado |
| `apiKey` | TEXT | Não | API key customizada |
| `isActive` | BOOLEAN | Sim | Se está ativo |
| `displayOrder` | INTEGER | Sim | Ordem de exibição |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

**Relacionamentos:**
- `counselorId` → `counselors.counselorId`

---

### 2.9 counselor_opinions - Pareceres dos Conselheiros

Armazena pareceres individuais para revisão.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `analysisId` | INTEGER | Sim | Análise relacionada |
| `counselorId` | VARCHAR(50) | Sim | ID do conselheiro |
| `counselorName` | VARCHAR(100) | Sim | Nome do conselheiro |
| `opinionContent` | TEXT | Sim | Conteúdo do parecer |
| `status` | opinion_status | Sim | Estado (pending/approved/rejected) |
| `reviewerFeedback` | TEXT | Não | Feedback do GennovAIs |
| `revisionCount` | INTEGER | Sim | Número de revisões |
| `tokensUsed` | INTEGER | Não | Tokens utilizados |
| `estimatedCost` | NUMERIC(10,4) | Não | Custo estimado |
| `generatedAt` | TIMESTAMP | Sim | Data de geração |
| `reviewedAt` | TIMESTAMP | Não | Data de revisão |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

**Relacionamentos:**
- `analysisId` → `analyses.id`
- `counselorId` → `counselors.counselorId`

---

### 2.10 llm_usage_costs - Custos de Uso LLM

Rastreamento de custos por chamada LLM.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `analysisId` | INTEGER | Não | Análise relacionada |
| `userId` | INTEGER | Sim | Usuário |
| `counselorId` | VARCHAR(50) | Não | Conselheiro que fez a chamada |
| `llmProvider` | VARCHAR(50) | Sim | Provedor LLM |
| `llmModel` | VARCHAR(100) | Sim | Modelo utilizado |
| `inputTokens` | INTEGER | Sim | Tokens de entrada |
| `outputTokens` | INTEGER | Sim | Tokens de saída |
| `totalTokens` | INTEGER | Sim | Total de tokens |
| `costUsd` | NUMERIC(10,6) | Sim | Custo em USD |
| `temperature` | NUMERIC(3,2) | Não | Temperatura utilizada |
| `requestType` | VARCHAR(50) | Não | Tipo de requisição |
| `createdAt` | TIMESTAMP | Sim | Data de criação |

**Relacionamentos:**
- `analysisId` → `analyses.id`
- `userId` → `users.id`

---

### 2.11 llm_pricing - Preços dos Modelos LLM

Tabela de preços por provedor e modelo.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `provider` | VARCHAR(50) | Sim | Provedor (google, anthropic, openai) |
| `modelName` | VARCHAR(100) | Sim | Nome técnico do modelo |
| `displayName` | VARCHAR(150) | Não | Nome para exibição |
| `inputPricePerMillion` | NUMERIC(10,6) | Sim | Preço por 1M tokens entrada |
| `outputPricePerMillion` | NUMERIC(10,6) | Sim | Preço por 1M tokens saída |
| `description` | TEXT | Não | Descrição |
| `isActive` | BOOLEAN | Sim | Se pode ser usado |
| `supportsSync` | BOOLEAN | Sim | Suporta chamadas síncronas |
| `priceUpdatedAt` | TIMESTAMP | Não | Última atualização de preço |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

---

### 2.12 system_prompts - Prompts do Sistema

Prompts editáveis para o sistema multiagente.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `promptKey` | VARCHAR(100) | Sim, Único | Chave do prompt |
| `promptName` | VARCHAR(255) | Sim | Nome legível |
| `description` | TEXT | Não | Descrição do prompt |
| `promptContent` | TEXT | Sim | Conteúdo atual do prompt |
| `defaultContent` | TEXT | Sim | Conteúdo padrão (para reset) |
| `category` | prompt_category | Sim | Categoria |
| `updatedBy` | INTEGER | Não | Admin que atualizou |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

**Relacionamentos:**
- `updatedBy` → `users.id`

---

### 2.13 email_config - Configuração de Emails

Configurações de emails de notificação.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `configKey` | VARCHAR(100) | Sim, Único | Chave de configuração |
| `configValue` | TEXT | Sim | Valor (email ou JSON) |
| `description` | VARCHAR(255) | Não | Descrição |
| `sendEmails` | BOOLEAN | Sim | Se envia emails |
| `emailSubject` | TEXT | Não | Template do assunto |
| `emailBody` | TEXT | Não | Template do corpo (HTML) |
| `senderEmail` | VARCHAR(320) | Não | Email do remetente |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

---

### 2.14 temperature_config - Configuração de Temperatura

Temperatura LLM por tipo de agente.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `agentType` | VARCHAR(50) | Sim, Único | Tipo de agente |
| `temperature` | NUMERIC(3,2) | Sim | Valor (0.00 a 1.00) |
| `description` | VARCHAR(255) | Não | Descrição |
| `updatedBy` | INTEGER | Não | Admin que atualizou |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

**Relacionamentos:**
- `updatedBy` → `users.id`

---

### 2.15 system_parameters - Parâmetros do Sistema

Configurações globais da aplicação.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | SERIAL | PK | Identificador único |
| `key` | VARCHAR(100) | Sim, Único | Chave do parâmetro |
| `value` | TEXT | Sim | Valor |
| `description` | TEXT | Não | Descrição |
| `type` | parameter_type | Sim | Tipo do valor |
| `createdAt` | TIMESTAMP | Sim | Data de criação |
| `updatedAt` | TIMESTAMP | Sim | Data de atualização |

---

## 3. Relacionamentos entre Tabelas

```
users
  │
  ├──< invited_users (invitedBy)
  ├──< analyses (userId)
  ├──< analysis_templates (userId)
  ├──< payments (userId)
  ├──< llm_usage_costs (userId)
  ├──< system_prompts (updatedBy)
  └──< temperature_config (updatedBy)

analyses
  │
  ├──< analysis_sources (analysisId)
  ├──< payments (analysisId)
  ├──< counselor_opinions (analysisId)
  └──< llm_usage_costs (analysisId)

counselors
  │
  ├──< counselor_llm_config (counselorId)
  └──< counselor_opinions (counselorId)
```

---

## Resumo

| Tabela | Descrição | Registros Típicos |
|--------|-----------|-------------------|
| users | Usuários do sistema | Dezenas a centenas |
| invited_users | Convites pendentes | Poucos |
| analyses | Análises geopolíticas | Centenas a milhares |
| analysis_sources | Fontes por análise | Milhares |
| analysis_templates | Templates salvos | Dezenas |
| payments | Pagamentos | Centenas |
| counselors | Conselheiros/Analistas | 6-10 (fixo) |
| counselor_llm_config | Config LLM | 6-10 |
| counselor_opinions | Pareceres | Milhares |
| llm_usage_costs | Custos LLM | Milhares |
| llm_pricing | Preços | Dezenas |
| system_prompts | Prompts | Dezenas |
| email_config | Config emails | Poucos |
| temperature_config | Config temperatura | Poucos |
| system_parameters | Parâmetros | Dezenas |

---

*Documento gerado automaticamente pelo sistema Conselho IA de Geopolítica da FGV*
