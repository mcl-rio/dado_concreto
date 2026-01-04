# Mapeamento de Prompts LLM - Sessão do Conselho (Passo 6)

Este documento descreve todas as funções que chamam modelos de linguagem (LLMs) para os agentes do Conselho durante a Sessão do Conselho, identificando os system prompts e user prompts utilizados.

---

## Visão Geral da Arquitetura

O sistema multi-agentes está implementado principalmente no arquivo:

> **Arquivo principal:** `server/services/multiAgents.ts`

A função central que orquestra a Sessão do Conselho é:

```typescript
export async function runMultiAgentAnalysis(
  objective: string,
  context: string | undefined,
  sources: string[],
  selectedAnalystIds: string[],
  onProgress?: (step: AnalysisStep) => void,
  options?: {
    userId?: number;
    dbAnalysisId?: number;
    useWebSearch?: boolean;
    useCounselorKnowledge?: boolean;
    structure?: string;
  }
): Promise<MultiAgentAnalysis>
```

Esta função é chamada pela mutation `analysis.executeMultiAgent` em `server/routers.ts` (linha ~1294).

---

## 1. Conselheiros (Counselors)

### Arquivo e Função

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `server/services/multiAgents.ts` |
| **Função** | `runMultiAgentAnalysis()` |
| **Linhas** | ~964-1035 |
| **Provider LLM** | Configurável por conselheiro (`gemini` ou `claude`) |
| **Chamada LLM** | `callLLM(analyst.llmProvider, analystPrompt, systemPromptWithPersonality, ...)` |

### System Prompt do Conselheiro

O system prompt do conselheiro é composto por duas partes:

1. **`analyst.systemPrompt`** - O prompt base do conselheiro (armazenado no objeto `Analyst`)
2. **Personalidade adicional** - Buscada do banco de dados via `db.getCounselorLlmConfig(analyst.id)`

```typescript
// Linhas 967-974
const counselorConfig = await db.getCounselorLlmConfig(analyst.id);
const personalityText = counselorConfig?.personality 
  ? `\n\nPERSONALIDADE ADICIONAL:\n${counselorConfig.personality}\n\nAdote esta personalidade em sua comunicação, mantendo seu conhecimento geopolítico e perspectiva teórica.`
  : '';

// System prompt com personalidade integrada
const systemPromptWithPersonality = analyst.systemPrompt + personalityText;
```

**Nota:** O `analyst.systemPrompt` é definido no objeto `Analyst` que é populado dinamicamente a partir do banco de dados. O array `ANALYSTS` é declarado vazio (linha 218) e deve ser populado externamente.

### User Prompt do Conselheiro (Prompt de Tarefa)

O user prompt é construído dinamicamente e inclui:

1. **Prompt de tarefa base** - Buscado do banco de dados com chave `'counselor_task'`
2. **Fallback padrão** - `DEFAULT_COUNSELOR_TASK_PROMPT`

```typescript
// Linhas 723-735 - DEFAULT_COUNSELOR_TASK_PROMPT
const DEFAULT_COUNSELOR_TASK_PROMPT = `Como {COUNSELOR_NAME}, especialista em {KEY_THEORY}, elabore seu parecer sobre o tema proposto.

INSTRUÇÕES:
1. Leia TODAS as fontes fornecidas cuidadosamente
2. Considere o título, contexto e objetivos da análise
3. Aplique sua perspectiva teórica específica ({KEY_THEORY})
4. Escreva em TEXTO CORRIDO, DISCURSIVO, em parágrafos bem desenvolvidos
5. NUNCA use bullet points, listas numeradas ou marcadores
6. Seja OBJETIVO e DIRETO na redação
7. Fundamente todas as afirmações em evidências ou teoria
8. Siga a estrutura do relatório definida (se houver)

Seu parecer deve ser denso, profundo e revelar seu conhecimento e experiência como um dos maiores pensadores geopolíticos da história.`;
```

### Prompt Completo Montado (User Prompt)

```typescript
// Linhas 988-1005
const analystPrompt = `TÍTULO DA ANÁLISE: ${objective}
${contextText}
${knowledgeNote}

FONTES DISPONÍVEIS:
${sourcesText}
${structureText}

---

${retryCount > 0 ? `FEEDBACK DO GENERAL NOVAES (Coordenador):
${novaeFeedback}

Reelabore seu parecer atendendo às observações acima.

---

` : ''}${processedTaskPrompt}`;
```

Onde `processedTaskPrompt` é o template com variáveis substituídas:
```typescript
const processedTaskPrompt = counselorTaskPrompt
  .replace(/{COUNSELOR_NAME}/g, analyst.fullName)
  .replace(/{KEY_THEORY}/g, analyst.keyTheory);
```

---

## 2. GennovAIs (Avaliador de Pareceres)

### Arquivo e Função

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `server/services/multiAgents.ts` |
| **Função** | `runMultiAgentAnalysis()` |
| **Linhas** | ~1121-1149 |
| **Provider LLM** | `claude` (Anthropic) |
| **Chamada LLM** | `callLLM("claude", novaesPrompt, novaesSystemPrompt, ...)` |

### System Prompt do GennovAIs (Avaliador)

```typescript
// Linhas 681-697 - DEFAULT_NOVAES_PROMPT
const DEFAULT_NOVAES_PROMPT = `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Sua função é avaliar a qualidade dos pareceres elaborados pelos Conselheiros.

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

Seja rigoroso mas justo. Aprove pareceres que atendam aos padrões de excelência da FGV.`;
```

Este prompt é buscado do banco de dados com a chave `'novaes_proposal_evaluator'`:

```typescript
// Linhas 1142-1143
const novaesBasePrompt = await getSystemPrompt('novaes_proposal_evaluator', DEFAULT_NOVAES_PROMPT);
const novaesSystemPrompt = novaesBasePrompt + novaesPersonality;
```

### User Prompt do GennovAIs (Avaliação)

```typescript
// Linhas 1121-1128
const novaesPrompt = `Avalie o seguinte parecer elaborado por ${analyst.fullName} (${analyst.keyTheory}):

PARECER:
${currentOpinion}

---

Avalie se o parecer atende aos critérios de qualidade. Responda em JSON.`;
```

---

## 3. GennovAIs (Coordenação - Mensagens Dinâmicas)

### Arquivo e Função

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `server/services/multiAgents.ts` |
| **Função** | `generateNovAIsCoordinationMessage()` |
| **Linhas** | ~332-373 |
| **Provider LLM** | `gemini-2.0-flash-exp` (via `callGeminiFlash`) |

### System Prompt (Coordenação)

```typescript
// Linhas 341-344
const systemPrompt = `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV.
Gere UMA FRASE CURTA (máximo 2 linhas) no estilo militar bem-humorado para o contexto dado.
Seja direto, engraçado e mantenha o tom de um general coordenando uma reunião caótica de intelectuais.
NÃO use emojis. NÃO use bullet points. Apenas uma frase curta e direta.`;
```

### User Prompts (por contexto)

```typescript
// Linhas 346-354
const prompts: Record<string, string> = {
  convocation: `Contexto: O GennovAIs está convocando ${details.counselorCount} Conselheiros para analisar: "${details.topic}". Gere uma frase de abertura da sessão.`,
  waiting: `Contexto: O GennovAIs aguarda ${details.counselorName} elaborar seu parecer. Gere uma frase impaciente mas bem-humorada.`,
  receiving: `Contexto: ${details.counselorName} acabou de entregar seu parecer ao GennovAIs. Gere uma frase de recebimento.`,
  evaluating: `Contexto: O GennovAIs está avaliando o parecer de ${details.counselorName}. Gere uma frase de análise crítica.`,
  approved: `Contexto: O GennovAIs APROVOU o parecer de ${details.counselorName}. Gere uma frase de aprovação militar.`,
  rejected: `Contexto: O GennovAIs REJEITOU o parecer de ${details.counselorName} e pediu melhorias. Gere uma frase de rejeição bem-humorada.`,
  consolidating: `Contexto: O GennovAIs e o Max Weber estão consolidando ${details.counselorCount} pareceres aprovados. Progresso: ${details.progress}%. Gere uma frase sobre o trabalho de consolidação.`,
};
```

---

## 4. Max Weber (Consolidador/Editor)

### Arquivo e Função

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `server/services/multiAgents.ts` |
| **Função** | `runMultiAgentAnalysis()` |
| **Linhas** | ~1367-1384 |
| **Provider LLM** | `anthropic` (Claude) |
| **Chamada LLM** | `callLLM("anthropic", consolidationPrompt, editorSystemPrompt, ...)` |

### System Prompt do Max Weber

```typescript
// Linhas 699-721 - DEFAULT_EDITOR_PROMPT
const DEFAULT_EDITOR_PROMPT = `Você é o Max Weber do Conselho de Geopolítica da FGV. Você trabalha em conjunto com o GennovAIs para consolidar os pareceres aprovados dos Conselheiros em um único relatório final.

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

IMPORTANTE: Não mencione "Conselheiro" ou qualquer referência aos nomes dos analistas no texto final. As ideias devem ser apresentadas como análise integrada do Conselho.

Responda sempre em português brasileiro, com excelência acadêmica.`;
```

Este prompt é buscado do banco de dados com a chave `'editor_consolidator'`:

```typescript
// Linhas 1377-1378
const editorBasePrompt = await getSystemPrompt('editor_consolidator', DEFAULT_EDITOR_PROMPT);
const editorSystemPrompt = editorBasePrompt + editorPersonality;
```

### User Prompt do Max Weber (Consolidação)

```typescript
// Linhas 1320-1348
const consolidationPrompt = `TÍTULO DA ANÁLISE: ${objective}
${contextText}

PARECERES DOS CONSELHEIROS (${approvedOpinions.length} pareceres aprovados):
${allOpinions}

${structure ? `ESTRUTURA DO RELATÓRIO (OBRIGATÓRIA):
${structure}` : ''}

---

Trabalhando em conjunto com o GennovAIs, unifique todos os pareceres aprovados em um ÚNCO RELATÓRIO FINAL.

REGRAS OBRIGATÓRIAS:
1. NÃO mencione os nomes dos Conselheiros
2. NÃO use termos como "Conselheiro", "analista" ou referências aos autores
3. Integre as perspectivas de forma coesa, como se fosse uma análise única
4. Siga a estrutura do relatório definida acima
5. Mantenha estilo discursivo (texto corrido, sem bullet points)
6. O relatório deve ser DENSO, PROFUNDO e REVELADOR do conhecimento geopolítico
7. Qualidade compatível com publicações acadêmicas da FGV

FORMATO DO RELATÓRIO:
- COMECE IMEDIATAMENTE com o título principal (# Título)
- NÃO deixe linhas em branco antes do título
- NÃO inclua metadados, datas ou informações de cabeçalho antes do conteúdo
- O primeiro elemento do documento deve ser o título principal

Produza o relatório final consolidado.`;
```

---

## 5. Funções Auxiliares de Chamada LLM

### callLLM (Função Central)

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `server/services/multiAgents.ts` |
| **Linhas** | ~625-678 |

```typescript
export async function callLLM(
  provider: "gemini" | "google" | "claude" | "anthropic",
  prompt: string,
  systemPrompt: string,
  options?: {
    userId?: number;
    analysisId?: number;
    counselorId?: string;
    requestType?: string;
    temperature?: number;
  }
): Promise<{ text: string; tokens: { input: number; output: number }; cost: number }>
```

### callGemini / callGeminiDirect / callGeminiVertexAI

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `server/services/multiAgents.ts` |
| **Linhas** | ~376-525 |
| **Modelos** | `gemini-2.5-pro-preview-06-05`, `gemini-2.0-flash`, `gemini-1.5-pro` |

### callClaude

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `server/services/multiAgents.ts` |
| **Linhas** | ~527-590 |
| **Modelo** | `claude-3-7-sonnet-20250219` |

### callGeminiFlash (Coordenação Rápida)

| Atributo | Valor |
|----------|-------|
| **Arquivo** | `server/services/multiAgents.ts` |
| **Linhas** | ~277-329 |
| **Modelo** | `gemini-2.0-flash-exp` |

---

## 6. Chaves de Prompts no Banco de Dados

Os prompts são armazenados na tabela `system_prompts` e podem ser editados pelo administrador:

| Chave do Prompt | Descrição | Fallback |
|-----------------|-----------|----------|
| `counselor_task` | Prompt de tarefa para conselheiros | `DEFAULT_COUNSELOR_TASK_PROMPT` |
| `novaes_proposal_evaluator` | System prompt do GennovAIs para avaliação | `DEFAULT_NOVAES_PROMPT` |
| `editor_consolidator` | System prompt do Max Weber | `DEFAULT_EDITOR_PROMPT` |
| `novaes_session_coordinator` | Prompt de coordenação da sessão | `DEFAULT_COORDINATOR_PROMPT` |
| `novaes_approval_messages` | Mensagens de aprovação (separadas por linha) | Array estático |
| `novaes_rejection_messages` | Mensagens de rejeição (separadas por linha) | Array estático |

---

## 7. Fluxo Completo da Sessão do Conselho

```
1. runMultiAgentAnalysis() inicia
   ↓
2. GennovAIs convoca sessão (generateNovAIsCoordinationMessage - 'convocation')
   ↓
3. Para cada Conselheiro selecionado:
   a. Conselheiro elabora parecer (callLLM com analyst.llmProvider)
   b. GennovAIs avalia parecer (callLLM com 'claude')
   c. Se rejeitado, volta para (a) até MAX_RETRIES
   ↓
4. Max Weber consolida pareceres aprovados (callLLM com 'anthropic')
   ↓
5. Relatório final gerado
```

---

## Referências

- **Arquivo principal:** `/home/ubuntu/geopolitical-analyst/server/services/multiAgents.ts`
- **Rotas tRPC:** `/home/ubuntu/geopolitical-analyst/server/routers.ts`
- **Schema do banco:** `/home/ubuntu/geopolitical-analyst/drizzle/schema.ts`
- **Funções de banco:** `/home/ubuntu/geopolitical-analyst/server/db.ts`
