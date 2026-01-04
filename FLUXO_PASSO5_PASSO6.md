# Relatório Detalhado: Fluxo do Passo 5 ao Passo 6

## Visão Geral do Problema

O sistema está travando no **Passo 6 - Sessão do Conselho** com a mensagem "Preparando sessão" e 0% de progresso. A análise abaixo documenta todas as funções e prompts chamados desde o botão "Confirmar e iniciar pesquisa" até a última etapa visível.

---

## 1. FRONTEND: Início da Execução

### 1.1 Botão "Confirmar e iniciar pesquisa" (Passo 5)

Quando o usuário clica no botão no Passo 5, o sistema muda para o Passo 6 (`currentStep = "execute"`).

### 1.2 Auto-execução via useEffect (linhas 1310-1338)

```typescript
useEffect(() => {
  if (currentStep === "execute" && analysisId && !isExecuting && !generatedContent && !autoExecuteTriggered) {
    setAutoExecuteTriggered(true);
    setTimeout(() => {
      handleExecuteAnalysis();
    }, 500);
  }
}, [currentStep, analysisId, isExecuting, generatedContent, autoExecuteTriggered]);
```

**Função chamada:** `handleExecuteAnalysis()`

---

## 2. FRONTEND: handleExecuteAnalysis() (linhas 884-1212)

### 2.1 Inicialização de Estados

```typescript
setIsExecuting(true);
setExecutionStartTime(Date.now());
```

### 2.2 Criação dos Steps Iniciais (linhas 895-936)

O frontend cria uma lista de steps esperados:

1. **"GennovAIs convoca Conselheiros"** - phase: `convocation`, estimatedDuration: 3s
2. **Para cada conselheiro selecionado:**
   - `"{Nome} elaborando parecer"` - phase: `analysis`, estimatedDuration: 60s
   - `"GennovAIs avalia parecer de {Nome}"` - phase: `novaes_review`, estimatedDuration: 15s
3. **"GennovAIs e Max Weber unificam relatório"** - phase: `consolidation`, estimatedDuration: 50s

### 2.3 Conexão SSE (linhas 944-1128)

```typescript
const connectSSE = () => {
  eventSource = new EventSource(`/api/sse/analysis/${analysisId}/progress`);
  
  // Listeners para eventos:
  eventSource.addEventListener('connected', ...);
  eventSource.addEventListener('progress', ...);
  eventSource.addEventListener('complete', ...);
  eventSource.addEventListener('error', ...);
  eventSource.addEventListener('timeout', ...);
  eventSource.addEventListener('cancelled', ...);
};
```

### 2.4 Chamada ao Backend (linhas 1188-1193)

```typescript
const result = await executeMultiAgent.mutateAsync({
  analysisId,
  sources: regularSources,
  useWebSearch,
  useCounselorKnowledge,
});
```

**Rota tRPC chamada:** `trpc.analysis.executeMultiAgent`

---

## 3. BACKEND: executeMultiAgent (routers.ts, linhas 1144-1272)

### 3.1 Validações Iniciais

- Verifica se a análise existe e pertence ao usuário
- Verifica quota do usuário
- Atualiza status da análise para `'processing'`

### 3.2 Execução em Background (linhas 1183-1259)

```typescript
const executeInBackground = async () => {
  progressEmitter.startTimeoutTracking(analysisIdForTimeout, async () => {
    // Callback de timeout (10 minutos)
  });
  
  try {
    const result = await runMultiAgentAnalysis(
      analysis.objective,
      analysis.context || undefined,
      allSources,
      selectedAnalysts,
      undefined, // onProgress callback
      {
        userId: ctx.user.id,
        dbAnalysisId: input.analysisId,
        useWebSearch: input.useWebSearch,
        useCounselorKnowledge: input.useCounselorKnowledge,
      }
    );
    // ... atualiza banco e envia notificação
  } catch (error) {
    // ... trata erro
  }
};

executeInBackground().catch(err => console.error('[Background] Erro não tratado:', err));
```

### 3.3 Retorno Imediato

```typescript
return {
  success: true,
  started: true,
  message: 'Análise iniciada em background. Acompanhe o progresso via SSE.',
};
```

---

## 4. BACKEND: runMultiAgentAnalysis() (multiAgents.ts, linhas 742-1418)

### 4.1 Inicialização

```typescript
const analysisId = `analysis_${Date.now()}`;
const selectedAnalysts = ANALYSTS.filter(a => selectedAnalystIds.includes(a.id));
await loadMessagesFromDb(); // Carrega mensagens de aprovação/rejeição
```

### 4.2 ETAPA 0: Busca Web (se habilitada) - linhas 791-842

**Condição:** `if (options?.useWebSearch)`

```typescript
const webSearchStep: AnalysisStep = {
  step: "Consultando a web para informações adicionais",
  status: "running",
  phase: "web_search",
};
progressEmitter.emitProgress(dbAnalysisId, webSearchStep);

const searchResult = await searchAndFetchContent({
  query: objective,
  numResults: 5,
  language: 'pt',
});
```

### 4.3 ETAPA 1: Convocação (linhas 869-903)

**Função chamada:** `generateNovAIsCoordinationMessage('convocation', {...})`

```typescript
const convocationStep: AnalysisStep = {
  step: "GennovAIs convoca Conselheiros",
  status: "running",
  phase: "convocation",
};
progressEmitter.emitProgress(dbAnalysisId, convocationStep);

await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s

convocationStep.status = "completed";
progressEmitter.emitProgress(dbAnalysisId, convocationStep);
```

### 4.4 ETAPA 2: Loop de Conselheiros (linhas 910-1241)

**Para cada conselheiro selecionado:**

#### 4.4.1 Sub-etapa A: Conselheiro elabora parecer

**Funções chamadas:**
- `generateNovAIsCoordinationMessage('waiting', {counselorName})`
- `getCreativeMessage(analyst.id, dbAnalysisId)`
- `db.getCounselorLlmConfig(analyst.id)` - busca personalidade
- `getSystemPrompt('counselor_task', DEFAULT_COUNSELOR_TASK_PROMPT)`

**Prompt do Conselheiro:**
```
TÍTULO DA ANÁLISE: ${objective}
${contextText}
${knowledgeNote}

FONTES DISPONÍVEIS:
${sourcesText}
${structureText}

---

${processedTaskPrompt}
```

**Chamada LLM:**
```typescript
const result = await callLLM(analyst.llmProvider, analystPrompt, systemPromptWithPersonality, {
  userId,
  analysisId: dbAnalysisId,
  counselorId: analyst.id,
  requestType: "individual_report",
});
```

#### 4.4.2 Sub-etapa B: GennovAIs avalia parecer

**Funções chamadas:**
- `generateNovAIsCoordinationMessage('receiving', {counselorName})`
- `getCreativeMessage('gennovais', dbAnalysisId)`
- `db.getCounselorLlmConfig('gennovais')` - busca personalidade
- `getSystemPrompt('novaes_proposal_evaluator', DEFAULT_NOVAES_PROMPT)`

**Prompt de Avaliação:**
```
Avalie o seguinte parecer elaborado por ${analyst.fullName} (${analyst.keyTheory}):

PARECER:
${currentOpinion}

---

Avalie se o parecer atende aos critérios de qualidade. Responda em JSON.
```

**Chamada LLM:**
```typescript
const novaesResult = await callLLM("claude", novaesPrompt, novaesSystemPrompt, {
  userId,
  analysisId: dbAnalysisId,
  counselorId: "novaes",
  requestType: "evaluation",
});
```

**Resposta esperada (JSON):**
```json
{
  "aprovado": true/false,
  "feedback": "Comentário sobre a qualidade",
  "melhorias_necessarias": ["Lista se não aprovado"]
}
```

**Se aprovado:** Salva parecer no banco via `db.createCounselorOpinion()`
**Se rejeitado:** Incrementa retryCount (máximo 2 retries)

### 4.5 ETAPA 3: Consolidação Final (linhas 1243-1380)

**Funções chamadas:**
- `generateNovAIsCoordinationMessage('consolidating', {counselorCount, progress})`
- `getCreativeMessage('editor', dbAnalysisId)`
- `db.getCounselorLlmConfig('editor')` - busca personalidade
- `getSystemPrompt('editor_consolidator', DEFAULT_EDITOR_PROMPT)`

**Prompt de Consolidação:**
```
TÍTULO DA ANÁLISE: ${objective}
${contextText}

PARECERES DOS CONSELHEIROS (${approvedOpinions.length} pareceres aprovados):
${allOpinions}

${structure ? `ESTRUTURA DO RELATÓRIO (OBRIGATÓRIA): ${structure}` : ''}

---

Trabalhando em conjunto com o GennovAIs, unifique todos os pareceres aprovados em um ÚNICO RELATÓRIO FINAL.

REGRAS OBRIGATÓRIAS:
1. NÃO mencione os nomes dos Conselheiros
2. NÃO use termos como "Conselheiro", "analista" ou referências aos autores
3. Integre as perspectivas de forma coesa
4. Siga a estrutura do relatório definida
5. Mantenha estilo discursivo
6. O relatório deve ser DENSO, PROFUNDO e REVELADOR
7. Qualidade compatível com publicações acadêmicas da FGV
```

**Chamada LLM:**
```typescript
const editorResult = await callLLM("anthropic", consolidationPrompt, editorSystemPrompt, {
  userId,
  analysisId: dbAnalysisId,
  counselorId: "editor",
  requestType: "final_consolidation",
});
```

### 4.6 Finalização (linhas 1382-1418)

```typescript
analysis.totalTime = Date.now() - startTime;
analysis.status = hasRealError ? "error" : "completed";

if (dbAnalysisId) {
  if (analysis.status === "completed" && analysis.finalReport) {
    progressEmitter.emitComplete(dbAnalysisId, analysis.finalReport, analysis.totalCost);
  } else if (analysis.status === "error") {
    progressEmitter.emitError(dbAnalysisId, errorStep?.error || "Erro desconhecido");
  }
}

return analysis;
```

---

## 5. PROMPTS UTILIZADOS

### 5.1 DEFAULT_NOVAES_PROMPT (Avaliador de Pareceres)

```
Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Sua função é avaliar a qualidade dos pareceres elaborados pelos Conselheiros.

Critérios de avaliação:
1. O parecer está em formato discursivo (texto corrido, sem bullet points)?
2. A análise é objetiva e fundamentada?
3. O conhecimento geopolítico específico do Conselheiro foi aplicado corretamente?
4. O texto tem profundidade analítica adequada?
5. A redação é acadêmica e precisa?

Você deve responder SEMPRE em formato JSON com a seguinte estrutura:
{
  "aprovado": true/false,
  "feedback": "Comentário sobre a qualidade do parecer",
  "melhorias_necessarias": ["Lista de melhorias específicas se não aprovado"]
}

Seja rigoroso mas justo. Aprove pareceres que atendam aos padrões de excelência da FGV.
```

### 5.2 DEFAULT_EDITOR_PROMPT (Max Weber - Consolidador)

```
Você é o Max Weber do Conselho de Geopolítica da FGV. Você trabalha em conjunto com o GennovAIs para consolidar os pareceres aprovados dos Conselheiros em um único relatório final.

CONTEXTO DA SESSÃO DO CONSELHO:
O GennovAIs convocou a Sessão do Conselho e cada Conselheiro apresentou seu parecer individual. Após avaliação rigorosa do GennovAIs, todos os pareceres foram aprovados. Agora, você e o GennovAIs devem unificar essas perspectivas em um relatório coeso.

REGRAS OBRIGATÓRIAS:
1. O relatório final NÃO DEVE mencionar os nomes dos Conselheiros
2. O relatório DEVE seguir a estrutura aprovada pelo usuário
3. Integre as diferentes perspectivas de forma coesa e fluida
4. Mantenha o estilo discursivo (texto corrido, sem bullet points)
5. Elimine redundâncias e contradições
6. Garanta qualidade acadêmica compatível com publicações da FGV

O documento final deve:
- Apresentar argumentação rigorosa e bem estruturada
- Integrar as diferentes perspectivas teóricas de forma equilibrada
- Oferecer conclusões fundamentadas em evidências
- Manter tom acadêmico formal e objetivo
- Estar pronto para publicação ou apresentação institucional
```

### 5.3 DEFAULT_COUNSELOR_TASK_PROMPT (Template para Conselheiros)

```
Como {COUNSELOR_NAME}, especialista em {KEY_THEORY}, elabore seu parecer sobre o tema proposto.

INSTRUÇÕES:
[Continua com instruções específicas para elaboração do parecer]
```

### 5.4 DEFAULT_COORDINATOR_PROMPT (Coordenador de Sessão)

```
Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Sua missão é coordenar a sessão de análise e orientar os Conselheiros.

Suas responsabilidades:
1. Apresentar o tema da análise de forma clara e objetiva
2. Contextualizar a importância geopolítica do assunto
3. Convocar os Conselheiros especialistas adequados
4. Orientar sobre a estrutura do relatório a ser seguida
5. Estabelecer expectativas de qualidade e rigor acadêmico

Seu tom deve ser formal, direto e inspirador, refletindo a seriedade da FGV.
```

---

## 6. SISTEMA DE EVENTOS SSE

### 6.1 Eventos Emitidos

| Evento | Quando | Dados |
|--------|--------|-------|
| `connected` | Conexão estabelecida | - |
| `progress` | A cada atualização de step | step, status, phase, progress, novaesMessage, etc. |
| `complete` | Análise concluída com sucesso | finalReport, totalCost |
| `error` | Erro na análise | error message |
| `timeout` | 10 minutos sem progresso | error message |
| `cancelled` | Cancelamento pelo usuário | message |

### 6.2 Heartbeat

Durante cada etapa longa, um `setInterval` de 5 segundos atualiza:
- `progress` (incremento gradual)
- `creativeMessage` (mensagens variadas)

---

## 7. POSSÍVEIS PONTOS DE FALHA

### 7.1 Problema Identificado: Travamento em "Preparando sessão"

O frontend mostra "0 de 2 etapas" e "Preparando sessão" com 0% de progresso. Isso indica que:

1. **A conexão SSE pode não estar recebendo eventos** - O primeiro evento `progress` (convocação) não está chegando ao frontend.

2. **O backend pode estar falhando antes de emitir o primeiro evento** - Possíveis causas:
   - Erro ao carregar mensagens do banco (`loadMessagesFromDb()`)
   - Erro ao gerar mensagem de convocação (`generateNovAIsCoordinationMessage()`)
   - Erro na busca web (se habilitada)

3. **Problema de sincronização** - O frontend espera o SSE estar conectado antes de iniciar, mas há uma race condition possível.

### 7.2 Verificações Recomendadas

1. **Verificar logs do servidor** para erros em:
   - `[MultiAgent]` - logs da análise
   - `[SSE]` - logs de eventos
   - `[LLM]` - logs de chamadas aos modelos

2. **Verificar se a função `generateNovAIsCoordinationMessage()` está funcionando**

3. **Verificar se o `progressEmitter` está emitindo eventos corretamente**

4. **Verificar se há erros de conexão SSE no console do navegador**

---

## 8. FLUXO RESUMIDO

```
[Frontend]                              [Backend]
    |                                       |
    |-- Passo 5: Clica "Confirmar" -------->|
    |                                       |
    |-- useEffect: currentStep="execute" -->|
    |                                       |
    |-- handleExecuteAnalysis() ----------->|
    |   |                                   |
    |   |-- Conecta SSE ------------------->|
    |   |                                   |
    |   |-- executeMultiAgent.mutate() ---->|-- executeMultiAgent()
    |                                       |   |
    |                                       |   |-- Valida análise
    |                                       |   |-- Atualiza status
    |                                       |   |-- executeInBackground()
    |                                       |       |
    |<-- Retorna {success: true} -----------|       |
    |                                       |       |
    |                                       |       |-- runMultiAgentAnalysis()
    |                                       |           |
    |<-- SSE: progress (convocação) --------|<----------|-- emitProgress()
    |                                       |           |
    |<-- SSE: progress (conselheiro 1) -----|<----------|-- callLLM() + emitProgress()
    |                                       |           |
    |<-- SSE: progress (avaliação 1) -------|<----------|-- callLLM() + emitProgress()
    |                                       |           |
    |   ... (repete para cada conselheiro)  |           |
    |                                       |           |
    |<-- SSE: progress (consolidação) ------|<----------|-- callLLM() + emitProgress()
    |                                       |           |
    |<-- SSE: complete --------------------|<----------|-- emitComplete()
    |                                       |
    |-- Exibe relatório final              |
```

---

*Documento gerado em 29/12/2025*
