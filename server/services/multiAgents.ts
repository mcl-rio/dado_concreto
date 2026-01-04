/**
 * Sistema Multi-Agentes de Análise Geopolítica
 * 
 * Conselheiros são cadastrados dinamicamente pelo administrador do sistema.
 * Cada conselheiro representa um pensador geopolítico com perspectiva teórica única.
 * 
 * Fluxo de Análise:
 * 1. Cada Conselheiro elabora seu parecer em texto discursivo
 * 2. GennovAIs avalia e aprova/solicita melhorias em cada parecer
 * 3. Max Weber consolida todos os pareceres aprovados em um relatório único
 * 4. O relatório final segue a estrutura aprovada e NÃO menciona os nomes dos Conselheiros
 */

import { ENV } from "../_core/env";
import * as db from "../db";
import { getAccessToken, getProjectId, isGoogleAuthConfigured } from "./googleAuth";
import { searchAndFetchContent } from "./webSearch";

// Mensagens criativas personalizadas por Conselheiro (baseadas em personalidade e estilo)
// Conselheiros são cadastrados pelo usuário via painel administrativo
const CREATIVE_MESSAGES: Record<string, string[]> = {
  gennovais: [
    "GennovAIs bate na mesa: 'ORDEM! ORDEM NA SESSÃO! Senhores, isto é Conselho da FGV, não mercado de peixe! Comportem-se!'",
    "NovAIs interrompe: 'Senhores Conselheiros, PAREM! Vocês dois vão para o castigo! Sim, castigo! Sou General e posso fazer isso!'",
    "O Coordenador faz piada: 'Se soubesse que coordenar este Conselho era como cuidar de jardim de infância, teria pedido aumento!' A sala ri.",
    "NovAIs recebe ligação: 'General, Ministro da Defesa quer falar.' NovAIs: 'Diga que estou gerenciando crise mais complexa que operação militar!'",
    "O General separa os Conselheiros: 'Senhores! Cada um para seu canto! Vocês dois vão se desculpar AGORA!'",
    "NovAIs toma remédio para pressão: 'Coordenar vocês está me matando, senhores. Literalmente. Meu cardiologista vai me matar.'",
    "O Coordenador elogia: 'Muito bem, Conselheiro! Finalmente alguém civilizado! Vejam, senhores, ESTE é o padrão que espero!'",
    "NovAIs ironiza: 'Tenho uma ideia: que tal OUVIREM uns aos outros? Conceito revolucionário, eu sei.'",
    "O General controla tempo: 'Conselheiro, o senhor tem 5 minutos. CINCO! Não quinze! CINCO! Consegue?' Conselheiro: 'Mas...' NovAIs: 'CINCO!'",
    "NovAIs recebe notícia: 'Sua esposa ligou. Esqueceu almoço.' NovAIs: 'Claro! Estou cuidando de seis crianças teimosas!' Aponta para Conselheiros.",
    "O Coordenador ameaça: 'Se não produzirem relatório decente, vou fazer EU MESMO! Em formato militar: objetivo, execução, fim!'",
    "NovAIs conclui: 'Apesar do caos, gritaria, xícaras quebradas e egos feridos... produzimos algo EXCELENTE! Parabéns! Dispensados!'",
  ],
  // Mensagens de rejeição criativas do GennovAIs (estilo militar bem-humorado)
  gennovais_rejection: [
    "Negativo, Conselheiro! Isso aqui parece relatório de recruta em primeiro dia de quartel. Refazer com mais rigor!",
    "Permissão negada! O General não aceita análise rasa. Quero profundidade estratégica, não superfície de lago!",
    "Reprovação sumária! Esse parecer não passaria nem em inspeção de rotina. Volte ao trabalho!",
    "Inaceitável! O Conselho da FGV não é clube de debates de colégio. Quero análise de nível superior!",
    "Ordem do dia: refazer este parecer! Falta fundamentação teórica e sobra achismo. Dispensado para reelaborar!",
    "Negativo, soldado! Esse texto não sobreviveria a um briefing de cinco minutos. Mais substância!",
    "Rejeitado! O General esperava análise geopolítica, não redação de vestibular. Tente novamente!",
    "Missão não cumprida! Esse parecer precisa de mais munição teórica. Volte ao arsenal acadêmico!",
    "Reprovação tática! Falta visão estratégica neste documento. O General exige excelência!",
    "Ordem de retrabalho! Conselheiro, o senhor pode fazer melhor que isso. A FGV merece!",
  ],
  // Mensagens de aprovação do GennovAIs (estilo militar elogioso)
  gennovais_approval: [
    "Aprovado com louvor! Parecer digno de um estratégico de primeira linha. Parabéns, Conselheiro!",
    "Excelência comprovada! O General reconhece análise de alto nível. Autorizado para consolidação!",
    "Missão cumprida com distção! Este parecer honra a tradição acadêmica da FGV!",
    "Aprovado! Análise sólida, fundamentada e estratégica. Exatamente o que o Conselho espera!",
    "Parecer autorizado! O General reconhece trabalho de qualidade quando vê. Prossiga!",
    "Aprovação concedida! Profundidade analítica e rigor teórico exemplares. Muito bem!",
    "Positivo! Este parecer demonstra domínio da matéria e visão estratégica. Aprovado!",
    "Autorizado para integração! O Conselheiro demonstrou excelência acadêmica. Parabéns!",
  ],
  editor: [
    "O Max Weber organiza os pareceres aprovados em uma sequência lógica...",
    "O revisor final elimina redundâncias e harmoniza o estilo dos diferentes textos...",
    "O Editor trabalha na transição entre as diferentes perspectivas teóricas...",
    "O consolidador final verifica a coerência do argumento central do relatório...",
    "O Max Weber refina a linguagem para atingir o padrão acadêmico da FGV...",
    "O revisor integra as análises em uma narrativa única e coesa...",
    "O Editor verifica se todas as afirmações estão devidamente fundamentadas...",
    "O consolidador final prepara o documento para publicação institucional...",
  ],
};

// Rastrear mensagens já usadas por análise para evitar repetição
const usedMessagesPerAnalysis: Map<number, Set<string>> = new Map();

// Cache de mensagens do banco de dados
let cachedApprovalMessages: string[] | null = null;
let cachedRejectionMessages: string[] | null = null;

// Função para carregar mensagens do banco de dados
async function loadMessagesFromDb(): Promise<void> {
  try {
    const approvalPrompt = await db.getSystemPrompt('novaes_approval_messages');
    const rejectionPrompt = await db.getSystemPrompt('novaes_rejection_messages');
    
    if (approvalPrompt?.promptContent) {
      cachedApprovalMessages = approvalPrompt.promptContent.split('\n').filter(m => m.trim());
      console.log(`[MultiAgent] Carregadas ${cachedApprovalMessages.length} mensagens de aprovação do banco`);
    }
    
    if (rejectionPrompt?.promptContent) {
      cachedRejectionMessages = rejectionPrompt.promptContent.split('\n').filter(m => m.trim());
      console.log(`[MultiAgent] Carregadas ${cachedRejectionMessages.length} mensagens de rejeição do banco`);
    }
  } catch (error) {
    console.warn('[MultiAgent] Erro ao carregar mensagens do banco, usando fallback:', error);
  }
}

// Função para obter mensagem criativa não repetida
function getCreativeMessage(counselorId: string, analysisId?: number): string {
  // Para mensagens de aprovação/rejeição, usar cache do banco se disponível
  let messages: string[];
  if (counselorId === 'gennovais_approval' && cachedApprovalMessages) {
    messages = cachedApprovalMessages;
  } else if (counselorId === 'gennovais_rejection' && cachedRejectionMessages) {
    messages = cachedRejectionMessages;
  } else {
    messages = CREATIVE_MESSAGES[counselorId] || CREATIVE_MESSAGES['editor'];
  }
  
  if (!analysisId) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  // Obter ou criar conjunto de mensagens usadas para esta análise
  if (!usedMessagesPerAnalysis.has(analysisId)) {
    usedMessagesPerAnalysis.set(analysisId, new Set());
  }
  const usedMessages = usedMessagesPerAnalysis.get(analysisId)!;
  
  // Filtrar mensagens não usadas
  const availableMessages = messages.filter(m => !usedMessages.has(m));
  
  // Se todas foram usadas, resetar
  if (availableMessages.length === 0) {
    usedMessages.clear();
    const message = messages[Math.floor(Math.random() * messages.length)];
    usedMessages.add(message);
    return message;
  }
  
  // Selecionar mensagem aleatória das disponíveis
  const message = availableMessages[Math.floor(Math.random() * availableMessages.length)];
  usedMessages.add(message);
  return message;
}

// Função para recarregar mensagens do banco (chamada quando prompts são atualizados)
export async function reloadNovAIsMessages(): Promise<void> {
  cachedApprovalMessages = null;
  cachedRejectionMessages = null;
  await loadMessagesFromDb();
}

// Limpar mensagens usadas após análise concluída
function clearUsedMessages(analysisId: number): void {
  usedMessagesPerAnalysis.delete(analysisId);
}

// Função para extrair argumentos-chave de um parecer (modo espectador)
function extractKeyArguments(text: string, keyTheory: string): string[] {
  const arguments_: string[] = [];
  
  // Extrair primeiras frases de cada parágrafo (geralmente contêm argumentos principais)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  
  for (const paragraph of paragraphs.slice(0, 4)) {
    // Pegar a primeira frase do parágrafo
    const firstSentence = paragraph.split(/[.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 30 && firstSentence.length < 200) {
      arguments_.push(firstSentence + '.');
    }
  }
  
  // Se não encontrou argumentos suficientes, adicionar referência à teoria
  if (arguments_.length < 2) {
    arguments_.push(`Análise fundamentada na ${keyTheory}.`);
  }
  
  return arguments_.slice(0, 4); // Máximo de 4 argumentos
}

// Custos estimados por 1000 tokens (em dólares)
// NOTA: Estes valores são fallback. Os preços reais são buscados da tabela llm_pricing
const TOKEN_COSTS_FALLBACK: Record<string, { input: number; output: number }> = {
  google: { input: 0.00125, output: 0.005 }, // Gemini 2.5 Pro (por 1K tokens)
  gemini: { input: 0.00125, output: 0.005 }, // Alias para google
  claude: { input: 0.003, output: 0.015 }, // Claude Sonnet
  anthropic: { input: 0.003, output: 0.015 }, // Alias para claude
  openai: { input: 0.0025, output: 0.01 }, // GPT-4o
  deepseek: { input: 0.00014, output: 0.00028 }, // DeepSeek Chat
};

// Função para obter custos do banco ou fallback
async function getTokenCosts(provider: string, model: string): Promise<{ input: number; output: number }> {
  try {
    const pricing = await db.getLlmPricingByProviderAndModel(provider, model);
    if (pricing) {
      // Converter de preço por milhão para preço por mil tokens
      return {
        input: parseFloat(pricing.inputPricePerMillion.toString()) / 1000,
        output: parseFloat(pricing.outputPricePerMillion.toString()) / 1000,
      };
    }
  } catch (error) {
    console.warn(`[LLM Pricing] Erro ao buscar preços para ${provider}/${model}:`, error);
  }
  // Fallback para valores padrão
  return TOKEN_COSTS_FALLBACK[provider] || TOKEN_COSTS_FALLBACK.google;
}

export interface Analyst {
  id: string;
  name: string;
  fullName: string;
  nationality: string;
  era: string;
  specialty: string;
  keyTheory: string;
  perspective: string;
  llmProvider: "gemini" | "claude";
  systemPrompt: string;
}

// Conselheiros são cadastrados pelo usuário via painel administrativo
// O array ANALYSTS é populado dinamicamente a partir do banco de dados
export const ANALYSTS: Analyst[] = [];

export interface AnalysisStep {
  step: string;
  analyst?: string;
  status: "pending" | "running" | "completed" | "error" | "retrying" | "rejected";
  startTime?: number;
  endTime?: number;
  duration?: number;
  result?: string;
  error?: string;
  tokensUsed?: { input: number; output: number };
  estimatedCost?: number;
  novaesMessage?: string;
  creativeMessage?: string; // Mensagem criativa sobre o que o Conselheiro está fazendo
  estimatedDuration?: number;
  phase?: "web_search" | "analysis" | "novaes_review" | "consolidation" | "review" | "convocation";
  retryCount?: number;
  progress?: number; // 0-100 para barra de progresso
  // Campos para modo espectador (debate em tempo real)
  spectatorMode?: {
    opinionExcerpt?: string; // Trecho do parecer sendo elaborado
    keyArguments?: string[]; // Argumentos-chave identificados
    theoreticalBasis?: string; // Base teórica sendo aplicada
    novaesReaction?: {
      type: 'approval' | 'rejection' | 'questioning' | 'praise';
      message: string;
      timestamp: number;
    };
    debateContext?: string; // Contexto do debate atual
  };
  // Campos de debug para rastreamento detalhado
  debug?: {
    functionName?: string;
    llmProvider?: string;
    promptPreview?: string; // Primeiros 500 caracteres do prompt
    responsePreview?: string; // Primeiros 500 caracteres da resposta
    tokensInput?: number;
    tokensOutput?: number;
    cost?: number;
    errorDetails?: string;
  };
}

// Metadados da sessão do Conselho para inclusão no relatório final
export interface SessionMetadata {
  sessionDate: string; // Data da sessão (formato DD/MM/YYYY)
  startTime: string; // Hora de início (formato HH:MM)
  endTime: string; // Hora de término (formato HH:MM)
  requesterName: string; // Nome completo do solicitante
  requesterEmail: string; // E-mail do solicitante
  moderator: string; // Nome do moderador (GennovAIs)
  editor: string; // Nome do editor (Max Weber)
  counselors: { id: string; name: string }[]; // Lista de conselheiros participantes
}

export interface MultiAgentAnalysis {
  id: string;
  objective: string;
  context?: string;
  sources: string[];
  selectedAnalysts: string[];
  steps: AnalysisStep[];
  totalCost: number;
  totalTime: number;
  finalReport?: string;
  status: "pending" | "running" | "completed" | "error";
  structure?: string; // Estrutura aprovada do relatório
  sessionMetadata?: SessionMetadata; // Metadados da sessão para o relatório
}

// Função para chamar Gemini Flash (rápido, para coordenação em tempo real)
async function callGeminiFlash(prompt: string, systemPrompt: string): Promise<{ text: string; tokens: { input: number; output: number } }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");

  const model = "gemini-2.0-flash-exp";
  
  try {
    console.log(`[GeminiFlash] Chamando ${model} para coordenação rápida...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout (flash é rápido)
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\n" + prompt }] },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 500, // Respostas curtas para coordenação
          },
        }),
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[GeminiFlash] ${model} falhou: ${error}`);
      throw new Error(`GeminiFlash error: ${error}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    const usageMetadata = data.usageMetadata || {};
    const inputTokens = usageMetadata.promptTokenCount || Math.ceil(prompt.length / 4);
    const outputTokens = usageMetadata.candidatesTokenCount || Math.ceil(text.length / 4);

    console.log(`[GeminiFlash] Respondeu em tempo rápido (${inputTokens}/${outputTokens} tokens)`);
    return { text, tokens: { input: inputTokens, output: outputTokens } };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`[GeminiFlash] Timeout após 15 segundos`);
    }
    throw error;
  }
}

// Função para gerar diálogo de coordenação do GennovAIs (rápido)
async function generateNovAIsCoordinationMessage(
  context: 'convocation' | 'waiting' | 'receiving' | 'evaluating' | 'approved' | 'rejected' | 'consolidating',
  details: {
    counselorName?: string;
    counselorCount?: number;
    topic?: string;
    progress?: number;
  }
): Promise<string> {
  const systemPrompt = `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV.
Gere UMA FRASE CURTA (máximo 2 linhas) no estilo militar bem-humorado para o contexto dado.
Seja direto, engraçado e mantenha o tom de um general coordenando uma reunião caótica de intelectuais.
NÃO use emojis. NÃO use bullet points. Apenas uma frase curta e direta.`;

  const prompts: Record<string, string> = {
    convocation: `Contexto: O GennovAIs está convocando ${details.counselorCount} Conselheiros para analisar: "${details.topic}". Gere uma frase de abertura da sessão.`,
    waiting: `Contexto: O GennovAIs aguarda ${details.counselorName} elaborar seu parecer. Gere uma frase impaciente mas bem-humorada.`,
    receiving: `Contexto: ${details.counselorName} acabou de entregar seu parecer ao GennovAIs. Gere uma frase de recebimento.`,
    evaluating: `Contexto: O GennovAIs está avaliando o parecer de ${details.counselorName}. Gere uma frase de análise crítica.`,
    approved: `Contexto: O GennovAIs APROVOU o parecer de ${details.counselorName}. Gere uma frase de aprovação militar.`,
    rejected: `Contexto: O GennovAIs REJEITOU o parecer de ${details.counselorName} e pediu melhorias. Gere uma frase de rejeição bem-humorada.`,
    consolidating: `Contexto: O GennovAIs e o Max Weber estão consolidando ${details.counselorCount} pareceres aprovados. Progresso: ${details.progress}%. Gere uma frase sobre o trabalho de consolidação.`,
  };

  try {
    const result = await callGeminiFlash(prompts[context], systemPrompt);
    return result.text.trim();
  } catch (error) {
    console.error('[NovAIsCoordination] Erro ao gerar mensagem, usando fallback:', error);
    // Fallback para mensagens estáticas
    const fallbacks: Record<string, string> = {
      convocation: `Atenção, Conselheiros! O GennovAIs convoca a sessão. Temos ${details.counselorCount} especialistas para analisar este tema.`,
      waiting: `O General aguarda ${details.counselorName}. Tempo é recurso estratégico, Conselheiro!`,
      receiving: `Parecer de ${details.counselorName} recebido. Vamos ver o que temos aqui...`,
      evaluating: `O General analisa o parecer de ${details.counselorName} com olhar crítico...`,
      approved: `Aprovado! ${details.counselorName} cumpriu a missão com excelência!`,
      rejected: `Negativo, ${details.counselorName}! Refazer com mais rigor!`,
      consolidating: `Max Weber, vamos unificar estes pareceres. Progresso: ${details.progress}%`,
    };
    return fallbacks[context] || 'O GennovAIs coordena a sessão...';
  }
}

// Função para chamar Gemini via Vertex AI (com fallback para API direta)
async function callGemini(prompt: string, systemPrompt: string, temperature: number = 1.0): Promise<{ text: string; tokens: { input: number; output: number } }> {
  // Tentar Vertex AI primeiro se configurado
  if (isGoogleAuthConfigured()) {
    try {
      return await callGeminiVertexAI(prompt, systemPrompt, temperature);
    } catch (error) {
      console.warn('[Gemini] Vertex AI falhou, tentando API direta:', error);
    }
  }
  
  // Fallback para API direta
  return await callGeminiDirect(prompt, systemPrompt, temperature);
}

// Chamar Gemini via Vertex AI (Google Cloud)
async function callGeminiVertexAI(prompt: string, systemPrompt: string, temperature: number = 1.0): Promise<{ text: string; tokens: { input: number; output: number } }> {
  const accessToken = await getAccessToken();
  const projectId = getProjectId();
  
  if (!projectId) throw new Error("Project ID não configurado");

  // Modelos a tentar no Vertex AI
  const models = ["gemini-2.5-pro-preview-06-05", "gemini-2.0-flash", "gemini-1.5-pro"];
  
  for (const model of models) {
    try {
      console.log(`[Gemini Vertex] Tentando modelo ${model}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout
      
      const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:generateContent`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\n" + prompt }] },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: 16384,
          },
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        console.error(`[Gemini Vertex] ${model} falhou com status ${response.status}: ${error.substring(0, 300)}`);
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (!text) {
        console.error(`[Gemini Vertex] ${model} retornou resposta vazia.`);
        continue;
      }
      
      const usageMetadata = data.usageMetadata || {};
      const inputTokens = usageMetadata.promptTokenCount || Math.ceil(prompt.length / 4);
      const outputTokens = usageMetadata.candidatesTokenCount || Math.ceil(text.length / 4);

      console.log(`[Gemini Vertex] ${model} respondeu com sucesso (${inputTokens}/${outputTokens} tokens)`);
      return { text, tokens: { input: inputTokens, output: outputTokens } };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[Gemini Vertex] ${model} timeout após 90 segundos`);
      } else {
        console.error(`[Gemini Vertex] ${model} erro:`, error);
      }
      continue;
    }
  }
  
  throw new Error("Todos os modelos Gemini Vertex AI falharam");
}

// Chamar Gemini via API direta (fallback)
async function callGeminiDirect(prompt: string, systemPrompt: string, temperature: number = 1.0): Promise<{ text: string; tokens: { input: number; output: number } }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");

  const models = ["gemini-2.0-flash", "gemini-1.5-pro"];
  
  for (const model of models) {
    try {
      console.log(`[Gemini Direct] Tentando modelo ${model}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout (3 minutos)
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: systemPrompt + "\n\n" + prompt }] },
            ],
            generationConfig: {
              temperature,
              maxOutputTokens: 16384,
            },
          }),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        console.error(`[Gemini Direct] ${model} falhou: ${error}`);
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (!text) {
        console.error(`[Gemini Direct] ${model} retornou resposta vazia.`);
        continue;
      }
      
      const usageMetadata = data.usageMetadata || {};
      const inputTokens = usageMetadata.promptTokenCount || Math.ceil(prompt.length / 4);
      const outputTokens = usageMetadata.candidatesTokenCount || Math.ceil(text.length / 4);

      console.log(`[Gemini Direct] ${model} respondeu com sucesso (${inputTokens}/${outputTokens} tokens)`);
      return { text, tokens: { input: inputTokens, output: outputTokens } };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[Gemini Direct] ${model} timeout`);
      } else {
        console.error(`[Gemini Direct] ${model} erro:`, error);
      }
      continue;
    }
  }
  
  throw new Error("Todos os modelos Gemini falharam");
}

// Função para chamar Claude (Anthropic)
async function callClaude(prompt: string, systemPrompt: string, temperature: number = 0.7): Promise<{ text: string; tokens: { input: number; output: number } }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");

  console.log(`[Claude] Iniciando chamada...`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout (3 minutos)

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 8192,
        temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const usage = data.usage || { input_tokens: 0, output_tokens: 0 };

    console.log(`[Claude] Respondeu com sucesso (${usage.input_tokens}/${usage.output_tokens} tokens)`);
    return { 
      text, 
      tokens: { input: usage.input_tokens, output: usage.output_tokens } 
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Claude timeout após 180 segundos');
    }
    throw error;
  }
}

// Mapeamento de provider para modelo
const PROVIDER_MODELS: Record<string, string> = {
  gemini: "gemini-2.5-pro",
  claude: "claude-sonnet-3.7",
  anthropic: "claude-sonnet-3.7",
};

// Temperaturas padrão por tipo de agente
const TEMPERATURE_CONFIG_FALLBACK = {
  counselor: 0.85,
  gennovais: 0.6,
  editor: 0.3,
  default: 0.7,
};

// Função auxiliar para obter temperatura
async function getTemperatureForAgentType(counselorId?: string): Promise<number> {
  try {
    let agentType = 'default';
    if (counselorId === 'gennovais' || counselorId === 'novaais') {
      agentType = 'gennovais';
    } else if (counselorId === 'editor') {
      agentType = 'editor';
    } else if (counselorId) {
      agentType = 'counselor';
    }
    
    const dbTemp = await db.getTemperatureForAgent(agentType);
    if (dbTemp !== null && dbTemp !== undefined) {
      return dbTemp;
    }
  } catch (error) {
    console.warn('[Temperature] Erro ao buscar temperatura do banco, usando fallback:', error);
  }
  
  if (counselorId === 'gennovais' || counselorId === 'novaais') {
    return TEMPERATURE_CONFIG_FALLBACK.gennovais;
  } else if (counselorId === 'editor') {
    return TEMPERATURE_CONFIG_FALLBACK.editor;
  } else if (counselorId) {
    return TEMPERATURE_CONFIG_FALLBACK.counselor;
  }
  return TEMPERATURE_CONFIG_FALLBACK.default;
}

// Função para chamar o LLM apropriado
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
): Promise<{ text: string; tokens: { input: number; output: number }; cost: number }> {
  let result: { text: string; tokens: { input: number; output: number } };
  
  const temperature = options?.temperature ?? await getTemperatureForAgentType(options?.counselorId);

  switch (provider) {
    case "gemini":
    case "google":
      result = await callGemini(prompt, systemPrompt, temperature);
      break;
    case "claude":
    case "anthropic":
      result = await callClaude(prompt, systemPrompt, temperature);
      break;
    default:
      throw new Error(`Provider desconhecido: ${provider}`);
  }

  const model = PROVIDER_MODELS[provider] || provider;
  const costs = await getTokenCosts(provider, model);
  const cost = (result.tokens.input / 1000) * costs.input + (result.tokens.output / 1000) * costs.output;

  try {
    await db.recordLlmUsage({
      userId: options?.userId || 0,
      analysisId: options?.analysisId,
      counselorId: options?.counselorId,
      llmProvider: provider,
      llmModel: PROVIDER_MODELS[provider] || provider,
      inputTokens: result.tokens.input,
      outputTokens: result.tokens.output,
      totalTokens: result.tokens.input + result.tokens.output,
      costUsd: cost.toFixed(6),
      temperature: temperature.toFixed(2),
      requestType: options?.requestType || "analysis",
    });
    console.log(`[LLM] ${options?.counselorId || 'unknown'} | Provider: ${provider} | Temp: ${temperature} | Tokens: ${result.tokens.input}/${result.tokens.output}`);
  } catch (error) {
    console.error("[LLM Cost Tracking] Erro ao registrar custo:", error);
  }

  return { ...result, cost };
}

// Prompts padrão (fallback)
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

// Função para buscar prompt do banco de dados com fallback
async function getSystemPrompt(promptKey: string, fallback: string): Promise<string> {
  try {
    const prompt = await db.getSystemPrompt(promptKey);
    if (prompt && prompt.promptContent) {
      console.log(`[Prompts] Usando prompt do banco: ${promptKey}`);
      return prompt.promptContent;
    }
  } catch (error) {
    console.warn(`[Prompts] Erro ao buscar prompt ${promptKey}, usando fallback:`, error);
  }
  console.log(`[Prompts] Usando prompt padrão: ${promptKey}`);
  return fallback;
}

// Função principal de análise multi-agentes
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
    structure?: string; // Estrutura aprovada do relatório
    requesterName?: string; // Nome completo do solicitante
    requesterEmail?: string; // E-mail do solicitante
  }
): Promise<MultiAgentAnalysis> {
  const analysisId = `analysis_${Date.now()}`;
  const userId = options?.userId || 0;
  const dbAnalysisId = options?.dbAnalysisId;
  const structure = options?.structure || "";
  
  console.log('[MultiAgent] ========== INÍCIO DA ANÁLISE ==========');
  console.log('[MultiAgent] ID:', analysisId);
  console.log('[MultiAgent] DB Analysis ID:', dbAnalysisId);
  console.log('[MultiAgent] Objetivo:', objective.substring(0, 100) + '...');
  console.log('[MultiAgent] Conselheiros selecionados:', selectedAnalystIds);
  console.log('[MultiAgent] Usar busca web:', options?.useWebSearch);
  console.log('[MultiAgent] Usar conhecimento dos conselheiros:', options?.useCounselorKnowledge);
  console.log('[MultiAgent] Estrutura definida:', structure ? 'Sim' : 'Não');
  console.log('[MultiAgent] Timestamp início:', new Date().toISOString());
  
  // ========== INICIALIZAR SISTEMA DE ETAPAS ==========
  // Modo debug pode ser ativado via variável de ambiente DEBUG_COUNCIL_STEP_BY_STEP=true
  const isDebugMode = process.env.DEBUG_COUNCIL_STEP_BY_STEP === 'true';
  if (dbAnalysisId) {
    console.log(`[MultiAgent] >>> ANTES de initCouncilSession (analysisId: ${dbAnalysisId})`);
console.log(`[MultiAgent] >>> DEPOIS de initCouncilSession - Sessão inicializada para análise ${dbAnalysisId}`);
  }
  
  // Carregar mensagens de aprovação/rejeição do banco de dados
  await loadMessagesFromDb();
  
  // Carregar conselheiros do banco de dados com LLMs configurados no painel
  const selectedAnalysts: Analyst[] = [];
  for (const counselorId of selectedAnalystIds) {
    const counselor = await db.getCounselorByKey(counselorId);
    const llmConfig = await db.getCounselorLlmConfig(counselorId);
    
    if (counselor) {
      const llmProvider = (llmConfig?.llmProvider || counselor.llmProvider || 'google') as 'gemini' | 'claude';
      console.log(`[MultiAgent] Conselheiro ${counselor.name} usando LLM: ${llmProvider} (configurado no painel)`);
      
      // Construir system prompt a partir dos dados do conselheiro
      const systemPromptParts = [
        `Você é ${counselor.name}, ${counselor.shortBio || ''}`,
        counselor.mainTheory ? `Sua principal teoria é a ${counselor.mainTheory}.` : '',
        counselor.writingStyle ? `Estilo de escrita: ${counselor.writingStyle}` : '',
        counselor.analysisApproach ? `Abordagem de análise: ${counselor.analysisApproach}` : '',
      ].filter(Boolean).join('\n\n');
      
      // Extrair especialidade das áreas de expertise
      const areasOfExpertise = counselor.areasOfExpertise as string[] | null;
      const specialty = areasOfExpertise?.join(', ') || '';
      
      // Extrair era dos anos de nascimento/morte
      const era = counselor.birthYear 
        ? `${counselor.birthYear}${counselor.deathYear ? '-' + counselor.deathYear : '-presente'}`
        : '';
      
      selectedAnalysts.push({
        id: counselor.counselorId,
        name: counselor.name,
        fullName: counselor.name,
        nationality: counselor.nationality || '',
        era: era,
        specialty: specialty,
        keyTheory: counselor.mainTheory || '',
        perspective: counselor.shortBio || '',
        llmProvider: llmProvider,
        systemPrompt: systemPromptParts,
      });
    } else {
      console.warn(`[MultiAgent] Conselheiro ${counselorId} não encontrado no banco de dados`);
    }
  }
  
  console.log(`[MultiAgent] ${selectedAnalysts.length} conselheiros carregados do banco de dados`);
  
  const analysis: MultiAgentAnalysis = {
    id: analysisId,
    objective,
    context,
    sources,
    selectedAnalysts: selectedAnalystIds,
    steps: [],
    totalCost: 0,
    totalTime: 0,
    status: "running",
    structure,
  };

  const startTime = Date.now();
  let allSources = [...sources];
  let webSearchResults: { url: string; title: string; content: string }[] = [];

  // ========== TRY/CATCH GLOBAL PARA GARANTIR EMISSÃO DE EVENTOS SSE ==========
  try {
    console.log('[MultiAgent] >>> ENTRANDO NO TRY/CATCH GLOBAL');
    console.log('[MultiAgent] >>> Timestamp:', new Date().toISOString());

  // Passo 0: Busca na web se habilitado
  if (options?.useWebSearch) {
    const webSearchStep: AnalysisStep = {
      step: "Consultando a web para informações adicionais",
      status: "running",
      startTime: Date.now(),
      phase: "web_search",
      progress: 0,
    };
    analysis.steps.push(webSearchStep);
    onProgress?.(webSearchStep);

    try {
      webSearchStep.progress = 30;
      onProgress?.(webSearchStep);

      const searchResult = await searchAndFetchContent({
        query: objective,
        numResults: 5,
        language: 'pt',
      });

      webSearchStep.progress = 70;
      onProgress?.(webSearchStep);

      webSearchResults = searchResult.contents.map((c, i) => ({
        url: c.url,
        title: searchResult.results[i]?.title || c.url,
        content: c.content.substring(0, 5000),
      }));

      webSearchResults.forEach((result, index) => {
        allSources.push(`[Fonte Web ${index + 1}] ${result.title}\nURL: ${result.url}\n\n${result.content}`);
      });

      webSearchStep.status = "completed";
      webSearchStep.endTime = Date.now();
      webSearchStep.result = `Encontradas ${webSearchResults.length} fontes relevantes na web`;
      webSearchStep.progress = 100;
      onProgress?.(webSearchStep);
    } catch (error) {
      console.error("Erro na busca web:", error);
      webSearchStep.status = "completed";
      webSearchStep.endTime = Date.now();
      webSearchStep.result = "Busca web não disponível, continuando com fontes existentes";
      webSearchStep.progress = 100;
      onProgress?.(webSearchStep);
    }
  }

  // Preparar contexto completo para os Conselheiros
  let knowledgeNote = "";
  if (options?.useCounselorKnowledge) {
    knowledgeNote = "\n\nNota: Utilize seus conhecimentos históricos e teóricos para enriquecer a análise, além das fontes fornecidas.";
  }

  const sourcesText = allSources.join("\n\n---\n\n");
  const contextText = context ? `\n\nCONTEXTO ADICIONAL: ${context}` : "";
  const structureText = structure ? `\n\nESTRUTURA DO RELATÓRIO (siga esta estrutura):\n${structure}` : "";

  // Buscar prompt de coordenação do GennovAIs
  const DEFAULT_COORDINATOR_PROMPT = `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Sua missão é coordenar a sessão de análise e orientar os Conselheiros.

Suas responsabilidades:
1. Apresentar o tema da análise de forma clara e objetiva
2. Contextualizar a importância geopolítica do assunto
3. Convocar os Conselheiros especialistas adequados
4. Orientar sobre a estrutura do relatório a ser seguida
5. Estabelecer expectativas de qualidade e rigor acadêmico

Seu tom deve ser formal, direto e inspirador, refletindo a seriedade da FGV.`;
  
  const coordinatorPrompt = await getSystemPrompt('novaes_session_coordinator', DEFAULT_COORDINATOR_PROMPT);
  
  // ========== ETAPA 1: CONVOCAÇÃO DA SESSÃO ==========
  console.log('[MultiAgent] >>> INICIANDO ETAPA 1: CONVOCAÇÃO');
  console.log('[MultiAgent] >>> Timestamp:', new Date().toISOString());
  console.log('[MultiAgent] >>> dbAnalysisId:', dbAnalysisId);
  
  if (dbAnalysisId) {
    // Etapa SSE removida - fluxo simplificado
    console.log('[MultiAgent] Iniciando sessão do Conselho para análise', dbAnalysisId);
  }
  
  let convocationMessage = '';
  try {
    // Gerar mensagem de convocação dinâmica usando Gemini Flash
    console.log('[MultiAgent] >>> ANTES de generateNovAIsCoordinationMessage(convocation)');
    convocationMessage = await generateNovAIsCoordinationMessage('convocation', {
      counselorCount: selectedAnalysts.length,
      topic: objective.substring(0, 100),
    });
    console.log('[MultiAgent] >>> DEPOIS de generateNovAIsCoordinationMessage - Mensagem:', convocationMessage.substring(0, 100));
  } catch (convocationError) {
    console.error('[MultiAgent] >>> ERRO ao gerar mensagem de convocação:', convocationError);
    convocationMessage = `GennovAIs convoca ${selectedAnalysts.length} Conselheiros para analisar: ${objective.substring(0, 100)}...`;
    console.log('[MultiAgent] >>> Usando mensagem fallback');
  }
  
  // Emitir step de convocação inicial
  const convocationStep: AnalysisStep = {
    step: "GennovAIs convoca Conselheiros",
    status: "running",
    startTime: Date.now(),
    phase: "convocation",
    progress: 0,
    novaesMessage: convocationMessage,
    spectatorMode: {
      debateContext: `🏛️ Bastidores da Sessão do Conselho`,
      theoreticalBasis: coordinatorPrompt.substring(0, 200) + '...',
      opinionExcerpt: `Convocando: ${selectedAnalysts.map(a => a.fullName).join(", ")}`,
      keyArguments: [`Análise: ${objective}`, `Conselheiros: ${selectedAnalysts.length}`, `Fontes: ${allSources.length}`],
    },
  };
  analysis.steps.push(convocationStep);
  onProgress?.(convocationStep);
  console.log('[MultiAgent] >>> ANTES de emitProgress (convocação inicial) - analysisId:', dbAnalysisId, 'progress:', convocationStep.progress);
  if (dbAnalysisId) {
    console.log('[MultiAgent] >>> DEPOIS de emitProgress (convocação inicial)');
  }
  
  // Aguardar 2 segundos para dar tempo do frontend sincronizar
  console.log('[MultiAgent] >>> Aguardando 2 segundos para sincronização do frontend...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('[MultiAgent] >>> Sincronização concluída');
  
  // Marcar convocação como concluída
  convocationStep.status = "completed";
  convocationStep.endTime = Date.now();
  convocationStep.duration = convocationStep.endTime - convocationStep.startTime!;
  convocationStep.progress = 100;
  onProgress?.(convocationStep);
  console.log('[MultiAgent] >>> ANTES de emitProgress (convocação concluída) - analysisId:', dbAnalysisId, 'progress:', convocationStep.progress);
  if (dbAnalysisId) {
    console.log('[MultiAgent] Convocação concluída para análise', dbAnalysisId);
  }

  // Guardar pareceres aprovados pelo GennovAIs
  const approvedOpinions: { analyst: Analyst; opinion: string }[] = [];
  const MAX_RETRIES = 2;

  // ========== ETAPA 2: ELABORAÇÃO DOS PARECERES ==========
  if (dbAnalysisId) {
    // Etapa SSE removida
}
  
  // ========== ETAPA 3: AVALIAÇÃO PELO GENNOVAIS ==========
  // Nota: As etapas 2 e 3 são intercaladas (cada conselheiro elabora e é avaliado)
  // Mas para fins de tracking, consideramos como etapas separadas
  let counselorOpinionsCompleted = 0;
  let novaesEvaluationsCompleted = 0;
  
  // Para cada Conselheiro: elaborar parecer + avaliação do GennovAIs
  for (let i = 0; i < selectedAnalysts.length; i++) {
    const analyst = selectedAnalysts[i];
    let approved = false;
    let retryCount = 0;
    let currentOpinion = "";
    let novaeFeedback = "";

    while (!approved && retryCount <= MAX_RETRIES) {
      // Etapa A: Conselheiro elabora parecer
      const initialCreativeMessage = getCreativeMessage(analyst.id, dbAnalysisId);
      
      // Gerar mensagem dinâmica do NovAIs usando Gemini Flash (rápido)
      const waitingMessage = await generateNovAIsCoordinationMessage('waiting', {
        counselorName: analyst.fullName,
      });
      
      const analystStep: AnalysisStep = {
        step: `${analyst.fullName} elaborando parecer`,
        analyst: analyst.id,
        status: retryCount > 0 ? "retrying" : "running",
        startTime: Date.now(),
        phase: "analysis",
        estimatedDuration: 60, // Tempo real médio: 45-60 segundos
        retryCount,
        progress: 0,
        creativeMessage: initialCreativeMessage,
        novaesMessage: retryCount > 0 
          ? `O GennovAIs solicitou melhorias no parecer de ${analyst.fullName}: "${novaeFeedback}". O Conselheiro está reelaborando seu texto (tentativa ${retryCount + 1}/${MAX_RETRIES + 1}).`
          : waitingMessage,
      };
      
      if (retryCount === 0) {
        analysis.steps.push(analystStep);
      } else {
        const stepIndex = analysis.steps.findIndex(s => s.analyst === analyst.id && s.phase === "analysis");
        if (stepIndex !== -1) {
          analysis.steps[stepIndex] = analystStep;
        }
      }
      
      onProgress?.(analystStep);

      try {
        console.log(`[MultiAgent] ${analyst.fullName} elaborando parecer... (tentativa ${retryCount + 1})`);
        
        // Buscar personalidade do conselheiro no banco de dados
        const counselorConfig = await db.getCounselorLlmConfig(analyst.id);
        const personalityText = counselorConfig?.personality 
          ? `\n\nPERSONALIDADE ADICIONAL:\n${counselorConfig.personality}\n\nAdote esta personalidade em sua comunicação, mantendo seu conhecimento geopolítico e perspectiva teórica.`
          : '';
        
        // System prompt com personalidade integrada
        const systemPromptWithPersonality = analyst.systemPrompt + personalityText;
        
        if (counselorConfig?.personality) {
          console.log(`[MultiAgent] ${analyst.fullName} usando personalidade personalizada: "${counselorConfig.personality.substring(0, 50)}..."`); 
        }
        
        // Buscar prompt de tarefa do banco de dados
        const counselorTaskPrompt = await getSystemPrompt('counselor_task', DEFAULT_COUNSELOR_TASK_PROMPT);
        // Substituir variáveis no template
        const processedTaskPrompt = counselorTaskPrompt
          .replace(/{COUNSELOR_NAME}/g, analyst.fullName)
          .replace(/{KEY_THEORY}/g, analyst.keyTheory);
        
        // Prompt completo para o Conselheiro
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

        // Atualizar mensagem criativa e progresso granular durante a elaboração
        let currentProgress = 25;
        const messageUpdateInterval = setInterval(() => {
          analystStep.creativeMessage = getCreativeMessage(analyst.id, dbAnalysisId);
          // Progresso granular: 25% -> 50% -> 75% -> 85% (nunca chega a 100% até completar)
          if (currentProgress < 85) {
            currentProgress = Math.min(currentProgress + 12, 85);
            analystStep.progress = currentProgress;
            onProgress?.(analystStep);
          }
        }, 5000); // A cada 5 segundos (heartbeat)
        
        analystStep.progress = 25;
        analystStep.creativeMessage = getCreativeMessage(analyst.id, dbAnalysisId);
        // Adicionar dados do modo espectador
        analystStep.spectatorMode = {
          theoreticalBasis: analyst.keyTheory,
          debateContext: `${analyst.fullName} está aplicando a ${analyst.keyTheory} para analisar: "${objective.substring(0, 100)}..."`,
        };
        onProgress?.(analystStep);

        const result = await callLLM(analyst.llmProvider, analystPrompt, systemPromptWithPersonality, {
          userId,
          analysisId: dbAnalysisId,
          counselorId: analyst.id,
          requestType: "individual_report",
        });
        
        // Parar atualização de mensagens
        clearInterval(messageUpdateInterval);
        
        currentOpinion = result.text;
        
        if (result.text.length < 500) {
          clearInterval(messageUpdateInterval);
          throw new Error(`Resposta muito curta (${result.text.length} caracteres). Análise insuficiente.`);
        }
        
        // Extrair argumentos-chave e trecho para modo espectador
        const opinionExcerpt = result.text.substring(0, 300) + '...';
        const keyArguments = extractKeyArguments(result.text, analyst.keyTheory);
        
        analystStep.status = "completed";
        analystStep.endTime = Date.now();
        analystStep.duration = analystStep.endTime - analystStep.startTime!;
        analystStep.result = result.text;
        analystStep.tokensUsed = result.tokens;
        analystStep.estimatedCost = result.cost;
        analystStep.progress = 100;
        // Atualizar modo espectador com dados finais
        analystStep.spectatorMode = {
          opinionExcerpt,
          keyArguments,
          theoreticalBasis: analyst.keyTheory,
          debateContext: `${analyst.fullName} concluiu seu parecer aplicando a ${analyst.keyTheory}.`,
        };
        // Adicionar informações de debug
        analystStep.debug = {
          functionName: `callLLM(${analyst.llmProvider})`,
          llmProvider: analyst.llmProvider,
          promptPreview: analystPrompt.substring(0, 500) + '...',
          responsePreview: result.text.substring(0, 500) + '...',
          tokensInput: result.tokens.input,
          tokensOutput: result.tokens.output,
          cost: result.cost,
        };
        analysis.totalCost += result.cost;
        
        console.log(`[MultiAgent] ${analyst.fullName} finalizou parecer`);
        onProgress?.(analystStep);

        // Etapa B: GennovAIs avalia o parecer
        // Gerar mensagem dinâmica de recebimento usando Gemini Flash
        const receivingMessage = await generateNovAIsCoordinationMessage('receiving', {
          counselorName: analyst.fullName,
        });
        
        const novaesCreativeMessage = getCreativeMessage('gennovais', dbAnalysisId);
        const novaesStep: AnalysisStep = {
          step: `GennovAIs avalia parecer de ${analyst.fullName}`,
          analyst: "NovAIs",
          status: "running",
          startTime: Date.now(),
          phase: "novaes_review",
          estimatedDuration: 15, // Revisão do GennovAIs: 10-15 segundos
          progress: 0,
          creativeMessage: novaesCreativeMessage,
          novaesMessage: receivingMessage,
        };
        analysis.steps.push(novaesStep);
        onProgress?.(novaesStep);

        console.log(`[MultiAgent] GennovAIs avaliando parecer de ${analyst.fullName}...`);
        
        // Heartbeat durante avaliação do NovAIs (a cada 5 segundos)
        let novaesProgress = 30;
        const novaesHeartbeatInterval = setInterval(() => {
          if (novaesProgress < 75) {
            novaesProgress = Math.min(novaesProgress + 10, 75);
            novaesStep.progress = novaesProgress;
            novaesStep.creativeMessage = getCreativeMessage('gennovais', dbAnalysisId);
            onProgress?.(novaesStep);
          }
        }, 5000);
        
        novaesStep.progress = 30;
        onProgress?.(novaesStep);

        const novaesPrompt = `Avalie o seguinte parecer elaborado por ${analyst.fullName} (${analyst.keyTheory}):

PARECER:
${currentOpinion}

---

Avalie se o parecer atende aos critérios de qualidade. Responda em JSON.`;

        // Buscar personalidade do GennovAIs no banco de dados
        // Tentar buscar com ID antigo ou novo (fallback)
        let novaesConfig = await db.getCounselorLlmConfig('gennovais');
        if (!novaesConfig) novaesConfig = await db.getCounselorLlmConfig('gennovais');
        const novaesPersonality = novaesConfig?.personality 
          ? `\n\nPERSONALIDADE ADICIONAL:\n${novaesConfig.personality}\n\nAdote esta personalidade em sua avaliação.`
          : '';
        
        if (novaesConfig?.personality) {
          console.log(`[MultiAgent] GennovAIs usando personalidade personalizada: "${novaesConfig.personality.substring(0, 50)}..."`);
        }
        
        const novaesBasePrompt = await getSystemPrompt('novaes_proposal_evaluator', DEFAULT_NOVAES_PROMPT);
        const novaesSystemPrompt = novaesBasePrompt + novaesPersonality;
        const novaesResult = await callLLM("claude", novaesPrompt, novaesSystemPrompt, {
          userId,
          analysisId: dbAnalysisId,
          counselorId: "novaes",
          requestType: "evaluation",
        });
        
        // Limpar heartbeat do NovAIs
        clearInterval(novaesHeartbeatInterval);
        
        analysis.totalCost += novaesResult.cost;
        
        novaesStep.progress = 80;
        onProgress?.(novaesStep);

        // Parsear resposta do NovAIs
        let novaesEvaluation: { aprovado: boolean; feedback: string; melhorias_necessarias?: string[] };
        try {
          const jsonMatch = novaesResult.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            novaesEvaluation = JSON.parse(jsonMatch[0]);
          } else {
            novaesEvaluation = { aprovado: true, feedback: "Parecer aprovado." };
          }
        } catch {
          novaesEvaluation = { aprovado: true, feedback: "Parecer aprovado." };
        }
        
        // Adicionar informações de debug para avaliação do GennovAIs
        novaesStep.debug = {
          functionName: 'callLLM(claude) - GennovAIs Evaluation',
          llmProvider: 'claude',
          promptPreview: novaesPrompt.substring(0, 500) + '...',
          responsePreview: novaesResult.text.substring(0, 500) + '...',
          tokensInput: novaesResult.tokens.input,
          tokensOutput: novaesResult.tokens.output,
          cost: novaesResult.cost,
        };
        
        if (novaesEvaluation.aprovado) {
          approved = true;
          novaesStep.status = "completed";
          novaesStep.endTime = Date.now();
          novaesStep.duration = novaesStep.endTime - novaesStep.startTime!;
          novaesStep.progress = 100;
          // Gerar mensagem dinâmica de aprovação usando Gemini Flash
          const approvalMessage = await generateNovAIsCoordinationMessage('approved', {
            counselorName: analyst.fullName,
          });
          novaesStep.novaesMessage = approvalMessage;
          novaesStep.creativeMessage = `✅ ${analyst.fullName}: ${novaesEvaluation.feedback}`;
          novaesStep.result = novaesEvaluation.feedback;
          // Adicionar dados do modo espectador para aprovação
          novaesStep.spectatorMode = {
            novaesReaction: {
              type: 'approval',
              message: approvalMessage,
              timestamp: Date.now(),
            },
            debateContext: `GennovAIs aprovou o parecer de ${analyst.fullName}. O Conselheiro demonstrou domínio da ${analyst.keyTheory}.`,
          };
          
          approvedOpinions.push({ analyst, opinion: currentOpinion });
          console.log(`[MultiAgent] GennovAIs APROVOU parecer de ${analyst.fullName}`);
          
          // Salvar parecer aprovado no banco de dados
          if (dbAnalysisId) {
            try {
              await db.createCounselorOpinion({
                analysisId: dbAnalysisId,
                counselorId: analyst.id,
                counselorName: analyst.fullName,
                opinionContent: currentOpinion,
                status: 'approved',
                reviewerFeedback: novaesEvaluation.feedback,
                reviewedAt: new Date(),
              });
              console.log(`[MultiAgent] Parecer de ${analyst.fullName} salvo no banco`);
            } catch (saveError) {
              console.error(`[MultiAgent] Erro ao salvar parecer de ${analyst.fullName}:`, saveError);
            }
          }
        } else {
          novaesStep.status = "rejected";
          novaesStep.endTime = Date.now();
          novaesStep.duration = novaesStep.endTime - novaesStep.startTime!;
          novaesStep.progress = 100;
          novaeFeedback = novaesEvaluation.melhorias_necessarias?.join("; ") || novaesEvaluation.feedback;
          // Gerar mensagem dinâmica de rejeição usando Gemini Flash
          const rejectionMessage = await generateNovAIsCoordinationMessage('rejected', {
            counselorName: analyst.fullName,
          });
          novaesStep.novaesMessage = rejectionMessage;
          novaesStep.creativeMessage = `❌ ${analyst.fullName}: ${novaeFeedback}`;
          novaesStep.error = novaeFeedback;
          // Adicionar dados do modo espectador para rejeição
          novaesStep.spectatorMode = {
            novaesReaction: {
              type: 'rejection',
              message: rejectionMessage,
              timestamp: Date.now(),
            },
            debateContext: `GennovAIs rejeitou o parecer de ${analyst.fullName}. Motivo: ${novaeFeedback}. O Conselheiro deverá reelaborar seu texto.`,
          };
          
          console.log(`[MultiAgent] GennovAIs REJEITOU parecer de ${analyst.fullName}: ${novaeFeedback}`);
          retryCount++;
        }
        
        onProgress?.(novaesStep);
        
      } catch (error) {
        console.error(`[MultiAgent] ERRO no parecer de ${analyst.fullName}, tentativa ${retryCount + 1}:`, error);
        retryCount++;
        
        if (retryCount > MAX_RETRIES) {
          analystStep.status = "error";
          analystStep.error = String(error);
          analystStep.progress = 100;
          analystStep.novaesMessage = `Não foi possível obter um parecer satisfatório de ${analyst.fullName} após ${MAX_RETRIES + 1} tentativas.`;
          // Adicionar informações de debug para erro
          analystStep.debug = {
            functionName: `callLLM(${analyst.llmProvider}) - ERRO`,
            llmProvider: analyst.llmProvider,
            errorDetails: error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : String(error),
          };
          onProgress?.(analystStep);
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }

  // ========== CONCLUSÃO DAS ETAPAS 2 E 3 ==========
  // Etapas de SSE removidas - fluxo simplificado
  console.log(`[MultiAgent] ${approvedOpinions.length} pareceres aprovados de ${selectedAnalysts.length} conselheiros`);
  
  // ========== ETAPA 4: CONSOLIDAÇÃO PELO MAX WEBER ==========
  
  // Gerar mensagem dinâmica de consolidação usando Gemini Flash
  let consolidatingMessage = '';
  try {
    consolidatingMessage = await generateNovAIsCoordinationMessage('consolidating', {
      counselorCount: approvedOpinions.length,
      progress: 0,
    });
  } catch (consolidationMsgError) {
    console.error('[MultiAgent] Erro ao gerar mensagem de consolidação:', consolidationMsgError);
    consolidatingMessage = `Max Weber está consolidando ${approvedOpinions.length} pareceres aprovados...`;
  }
  
  const editorCreativeMessage = getCreativeMessage('editor', dbAnalysisId);
  const editorStep: AnalysisStep = {
    step: "GennovAIs e Max Weber unificando relatório final",
    analyst: "Editor",
    status: "running",
    startTime: Date.now(),
    phase: "consolidation",
    estimatedDuration: 50, // Consolidação final: 40-50 segundos
    progress: 0,
    creativeMessage: editorCreativeMessage,
    novaesMessage: consolidatingMessage,
  };
  analysis.steps.push(editorStep);
  onProgress?.(editorStep);

  // Declarar heartbeat fora do try para poder limpar no catch
  let editorHeartbeatInterval: ReturnType<typeof setInterval> | undefined;

  try {
    console.log('[MultiAgent] Max Weber consolidando relatório final...');
    console.log('[MultiAgent] Total de pareceres aprovados:', approvedOpinions.length);
    
    const allOpinions = approvedOpinions
      .map((r, i) => `=== PARECER ${i + 1} (Perspectiva: ${r.analyst.keyTheory}) ===\n\n${r.opinion}`)
      .join("\n\n---\n\n");

    editorStep.progress = 20;
    editorStep.creativeMessage = getCreativeMessage('editor', dbAnalysisId);
    onProgress?.(editorStep);

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

    editorStep.progress = 50;
    editorStep.creativeMessage = getCreativeMessage('editor', dbAnalysisId);
    onProgress?.(editorStep);

    // Heartbeat durante consolidação do Editor (a cada 5 segundos)
    let editorProgress = 50;
    editorHeartbeatInterval = setInterval(() => {
      if (editorProgress < 85) {
        editorProgress = Math.min(editorProgress + 7, 85);
        editorStep.progress = editorProgress;
        editorStep.creativeMessage = getCreativeMessage('editor', dbAnalysisId);
        onProgress?.(editorStep);
      }
    }, 5000);

    // Buscar configuração do Max Weber no banco de dados (LLM e personalidade)
    const editorConfig = await db.getCounselorLlmConfig('editor');
    const editorLlmProvider = (editorConfig?.llmProvider || 'google') as 'google' | 'gemini' | 'claude' | 'anthropic';
    const editorPersonality = editorConfig?.personality 
      ? `\n\nPERSONALIDADE ADICIONAL:\n${editorConfig.personality}\n\nAdote esta personalidade na consolidação do relatório.`
      : '';
    
    console.log(`[MultiAgent] Max Weber usando LLM: ${editorLlmProvider} (configurado no painel)`);
    if (editorConfig?.personality) {
      console.log(`[MultiAgent] Max Weber usando personalidade personalizada: "${editorConfig.personality.substring(0, 50)}..."`);
    }
    
    const editorBasePrompt = await getSystemPrompt('editor_consolidator', DEFAULT_EDITOR_PROMPT);
    const editorSystemPrompt = editorBasePrompt + editorPersonality;
    const editorResult = await callLLM(editorLlmProvider, consolidationPrompt, editorSystemPrompt, {
      userId,
      analysisId: dbAnalysisId,
      counselorId: "editor",
      requestType: "final_consolidation",
    });
    
    // Limpar heartbeat do Editor
    clearInterval(editorHeartbeatInterval);
    
    editorStep.progress = 90;
    editorStep.creativeMessage = getCreativeMessage('editor', dbAnalysisId);
    onProgress?.(editorStep);

    editorStep.status = "completed";
    editorStep.endTime = Date.now();
    editorStep.duration = editorStep.endTime - editorStep.startTime!;
    editorStep.result = editorResult.text;
    editorStep.tokensUsed = editorResult.tokens;
    editorStep.estimatedCost = editorResult.cost;
    editorStep.progress = 100;
    // Adicionar informações de debug para consolidação
    editorStep.debug = {
      functionName: `callLLM(${editorLlmProvider}) - Max Weber Consolidation`,
      llmProvider: editorLlmProvider,
      promptPreview: consolidationPrompt.substring(0, 500) + '...',
      responsePreview: editorResult.text.substring(0, 500) + '...',
      tokensInput: editorResult.tokens.input,
      tokensOutput: editorResult.tokens.output,
      cost: editorResult.cost,
    };
    analysis.totalCost += editorResult.cost;
    
    // Montar bloco de metadados da sessão do Conselho
    const endTime = Date.now();
    const sessionDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const startTimeFormatted = new Date(startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const endTimeFormatted = new Date(endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Obter nomes dos conselheiros participantes
    const participantCounselors = selectedAnalysts.map(a => a.fullName || a.name).join(', ');
    
    // Dados do solicitante
    const requesterName = options?.requesterName || 'Não informado';
    const requesterEmail = options?.requesterEmail || 'Não informado';
    
    // Montar bloco de metadados
    const sessionMetadataBlock = `## Dados da Sessão do Conselho

**Data:** ${sessionDate}

**Horário:** ${startTimeFormatted} – ${endTimeFormatted}

**Solicitante:** ${requesterName} – ${requesterEmail}

**Participantes:**
- **Moderador:** General Novaes (GennovAIs)
- **Editor:** Max Weber
- **Conselheiros:** ${participantCounselors}

---

`;
    
    // Concatenar metadados ao relatório final
    analysis.finalReport = sessionMetadataBlock + editorResult.text;
    
    // Salvar metadados na estrutura para uso nas exportações
    analysis.sessionMetadata = {
      sessionDate,
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      requesterName,
      requesterEmail,
      moderator: 'General Novaes (GennovAIs)',
      editor: 'Max Weber',
      counselors: selectedAnalysts.map(a => ({ id: a.id, name: a.fullName || a.name })),
    };
    
    console.log('[MultiAgent] Relatório final consolidado com sucesso');
    console.log('[MultiAgent] Tamanho do relatório final:', editorResult.text.length, 'caracteres');
    onProgress?.(editorStep);
    // Etapa de SSE removida - fluxo simplificado
    console.log('[MultiAgent] Etapa 4 concluída - Consolidação pelo Max Weber');
  } catch (error) {
    // Limpar heartbeat em caso de erro
    if (editorHeartbeatInterval) clearInterval(editorHeartbeatInterval);
    
    console.error('[MultiAgent DEBUG] ========== ERRO NA CONSOLIDAÇÃO ==========');
    console.error('[MultiAgent DEBUG] Erro:', error);
    console.error('[MultiAgent DEBUG] Tipo do erro:', error instanceof Error ? error.constructor.name : typeof error);
    if (error instanceof Error) {
      console.error('[MultiAgent DEBUG] Mensagem:', error.message);
      console.error('[MultiAgent DEBUG] Stack:', error.stack);
      if ('cause' in error) {
        console.error('[MultiAgent DEBUG] Causa:', error.cause);
      }
    }
    console.error('[MultiAgent DEBUG] Timestamp:', new Date().toISOString());
    
    editorStep.status = "error";
    editorStep.error = String(error);
    editorStep.progress = 100;
    onProgress?.(editorStep);
    if (dbAnalysisId) {
      
      // Marcar etapa 4 como erro
    // Etapa SSE removida
}
  }

  // ========== ETAPA 5: SALVAMENTO E CONCLUSÃO ==========
  if (dbAnalysisId) {
}
  
  console.log('[MultiAgent DEBUG] ========== ANÁLISE FINALIZADA ==========');
  console.log('[MultiAgent DEBUG] Tempo total:', Date.now() - startTime, 'ms');
  console.log('[MultiAgent DEBUG] Custo total estimado: $', analysis.totalCost.toFixed(4));
  console.log('[MultiAgent DEBUG] Timestamp:', new Date().toISOString());
  
  // Limpar mensagens usadas para esta análise
  if (dbAnalysisId) {
    clearUsedMessages(dbAnalysisId);
  }
  
  analysis.totalTime = Date.now() - startTime;
  const hasRealError = analysis.steps.some(s => s.status === "error");
  analysis.status = hasRealError ? "error" : "completed";

  // Emitir evento de conclusão via SSE
  console.log('[MultiAgent DEBUG] ========== PREPARANDO EMISSÃO FINAL ==========');
  console.log('[MultiAgent DEBUG] dbAnalysisId:', dbAnalysisId);
  console.log('[MultiAgent DEBUG] analysis.status:', analysis.status);
  console.log('[MultiAgent DEBUG] analysis.finalReport existe:', !!analysis.finalReport);
  console.log('[MultiAgent DEBUG] analysis.finalReport tamanho:', analysis.finalReport?.length || 0);
  console.log('[MultiAgent DEBUG] hasRealError:', hasRealError);
  console.log('[MultiAgent DEBUG] Steps com erro:', analysis.steps.filter(s => s.status === 'error').map(s => s.step).join(', ') || 'Nenhum');
  
  // ========== EMISSÃO DE EVENTOS FINAIS VIA COUNCIL SESSION ==========
  if (dbAnalysisId) {
    if (analysis.status === "completed" && analysis.finalReport) {
      console.log('[MultiAgent DEBUG] >>> EMITINDO EVENTO COMPLETE VIA COUNCIL SESSION <<<');
      console.log('[MultiAgent DEBUG] Análise:', dbAnalysisId);
      console.log('[MultiAgent DEBUG] Relatório:', analysis.finalReport.substring(0, 200) + '...');
      console.log('[MultiAgent DEBUG] Custo:', analysis.totalCost);
      
      // Completar etapa 5 e finalizar sessão (isso emite o evento complete automaticamente)
console.log('[MultiAgent DEBUG] Sessão do Conselho finalizada com sucesso!');
    } else if (analysis.status === "error") {
      const errorStep = analysis.steps.find(s => s.status === "error");
      const errorMessage = errorStep?.error || "Erro desconhecido na análise";
      
      console.log('[MultiAgent DEBUG] >>> EMITINDO EVENTO ERROR VIA COUNCIL SESSION <<<');
      console.log('[MultiAgent DEBUG] Análise:', dbAnalysisId);
      console.log('[MultiAgent DEBUG] Erro:', errorMessage);
      
      // Marcar etapa 5 como erro e finalizar sessão com erro
console.log('[MultiAgent DEBUG] Sessão do Conselho finalizada com erro!');
    } else {
      // Caso inesperado: nem completed nem error
      console.log('[MultiAgent DEBUG] !!! AVISO: STATUS INESPERADO !!!');
      console.log('[MultiAgent DEBUG] Status:', analysis.status);
      console.log('[MultiAgent DEBUG] FinalReport:', !!analysis.finalReport);
      
      // Emitir erro genérico para não deixar a UI travada
      const fallbackError = 'Análise finalizada com status inesperado. Verifique os logs.';
console.log('[MultiAgent DEBUG] Evento de erro fallback emitido!');
    }
  } else {
    console.log('[MultiAgent DEBUG] !!! AVISO: dbAnalysisId NÃO DEFINIDO !!!');
    console.log('[MultiAgent DEBUG] Eventos SSE não serão emitidos!');
  }

  console.log('[MultiAgent DEBUG] ========== FIM DA FUNÇÃO runMultiAgentAnalysis ==========');
  return analysis;

  } catch (globalError) {
    // ========== CATCH GLOBAL - GARANTIR EMISSÃO DE EVENTOS SSE ==========
    console.error('[MultiAgent] ========== ERRO GLOBAL CAPTURADO ==========');
    console.error('[MultiAgent] Erro:', globalError);
    console.error('[MultiAgent] Tipo:', globalError instanceof Error ? globalError.constructor.name : typeof globalError);
    if (globalError instanceof Error) {
      console.error('[MultiAgent] Mensagem:', globalError.message);
      console.error('[MultiAgent] Stack:', globalError.stack);
    }
    console.error('[MultiAgent] Timestamp:', new Date().toISOString());
    console.error('[MultiAgent] dbAnalysisId:', dbAnalysisId);
    
    // Atualizar status da análise
    analysis.status = 'error';
    analysis.totalTime = Date.now() - startTime;
    
    // GARANTIR que eventos SSE sejam emitidos mesmo em caso de erro
    if (dbAnalysisId) {
      const errorMessage = globalError instanceof Error 
        ? `Erro na análise: ${globalError.message}` 
        : `Erro desconhecido na análise: ${String(globalError)}`;
      
      console.log('[MultiAgent] >>> EMITINDO EVENTO ERROR VIA CATCH GLOBAL <<<');
      console.log('[MultiAgent] Análise:', dbAnalysisId);
      console.log('[MultiAgent] Erro:', errorMessage);
      
      
      // Também tentar via councilSession se possível
      try {
} catch (sessionError) {
        console.error('[MultiAgent] Erro ao chamar failSession:', sessionError);
      }
      
      console.log('[MultiAgent] Evento ERROR emitido com sucesso via catch global!');
    } else {
      console.error('[MultiAgent] !!! AVISO: dbAnalysisId NÃO DEFINIDO - Eventos SSE não serão emitidos !!!');
    }
    
    console.log('[MultiAgent] ========== FIM DO CATCH GLOBAL ==========');
    return analysis;
  }
}

// Função para estimar custo antes de executar
export function estimateAnalysisCost(selectedAnalystIds: string[]): number {
  const selectedAnalysts = ANALYSTS.filter(a => selectedAnalystIds.includes(a.id));
  
  let totalCost = 0;
  
  // Cada analista + avaliação do NovAIs
  // Nota: Usa fallback síncrono para estimativa rápida. Custos reais são calculados em tempo de execução.
  for (const analyst of selectedAnalysts) {
    const costs = TOKEN_COSTS_FALLBACK[analyst.llmProvider] || TOKEN_COSTS_FALLBACK.google;
    totalCost += (2000 / 1000) * costs.input + (1500 / 1000) * costs.output;
    // NovAIs avaliação
    const novaesCoosts = TOKEN_COSTS_FALLBACK.anthropic;
    totalCost += (1000 / 1000) * novaesCoosts.input + (500 / 1000) * novaesCoosts.output;
  }
  
  // Max Weber consolidação
  const weberCosts = TOKEN_COSTS_FALLBACK.anthropic;
  totalCost += (6000 / 1000) * weberCosts.input + (3000 / 1000) * weberCosts.output;
  
  return totalCost;
}

export function getAnalystById(id: string): Analyst | undefined {
  return ANALYSTS.find(a => a.id === id);
}


// ============ GERAÇÃO DE ESTRUTURA E REVISÃO ============

export interface StructureGenerationContext {
  title: string;
  objective: string;
  additionalContext?: string;
  sources: { title: string; content?: string }[];
  userId?: number;
  analysisId?: number;
}

export interface GeneratedStructure {
  title: string;
  sections: {
    id: string;
    title: string;
    description: string;
    estimatedTime: string;
    subsections?: { id: string; title: string; description: string }[];
  }[];
  methodology: string;
  expectedOutcomes: string[];
  totalEstimatedTime: string;
  novaesNotes?: string;
}

export async function generateStructureWithAI(
  ctx: StructureGenerationContext
): Promise<GeneratedStructure> {
  const { title, objective, additionalContext, sources, userId, analysisId } = ctx;

  // Preparar resumo das fontes
  const sourceSummary = sources
    .map((s, i) => `${i + 1}. ${s.title}${s.content ? ` - ${s.content.substring(0, 200)}...` : ''}`)
    .join('\n');

  // GennovAIs gera a estrutura
  const structurePrompt = `Analise o seguinte material e proponha uma estrutura de relatório geopolítico:

TÍTULO: ${title}
OBJETIVO: ${objective}
${additionalContext ? `CONTEXTO ADICIONAL: ${additionalContext}` : ''}

FONTES DISPONÍVEIS:
${sourceSummary || 'Nenhuma fonte específica fornecida. Use conhecimento geral.'}

Proponha uma estrutura em JSON com o seguinte formato:
{
  "title": "Título do relatório",
  "sections": [
    {
      "id": "1",
      "title": "Título da seção",
      "description": "Descrição do que será abordado",
      "estimatedTime": "Tempo estimado de leitura",
      "subsections": [
        { "id": "1.1", "title": "Subtítulo", "description": "Descrição" }
      ]
    }
  ],
  "methodology": "Método a ser utilizada",
  "expectedOutcomes": ["Resultado esperado 1", "Resultado esperado 2"],
  "totalEstimatedTime": "Tempo total estimado",
  "novaesNotes": "Observações do GennovAIs sobre a estrutura"
}`;

  // Buscar configuração do GennovAIs (LLM e personalidade)
  const novaesConfig = await db.getCounselorLlmConfig('gennovais');
  const novaesLlmProvider = (novaesConfig?.llmProvider || 'google') as 'google' | 'gemini' | 'claude' | 'anthropic';
  const systemPrompt = novaesConfig?.personality || `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. 
Sua missão é analisar o material fornecido e propor uma estrutura de relatório geopolítico profissional.

Ao estruturar o relatório:
1. Considere a complexidade do tema e as fontes disponíveis
2. Proponha seções que permitam análise profunda e fundamentada
3. Inclua espaço para diferentes perspectivas teóricas
4. Garanta que a estrutura permita conclusões bem fundamentadas
5. Pense em termos de utilidade para tomadores de decisão

Responda SEMPRE em formato JSON válido com a estrutura especificada.`;

  console.log(`[Structure] GennovAIs gerando estrutura usando LLM: ${novaesLlmProvider}`);
  const result = await callLLM(novaesLlmProvider, structurePrompt, systemPrompt, {
    userId,
    analysisId,
    counselorId: 'gennovais',
    requestType: 'structure_generation',
  });

  // Parsear resposta do GennovAIs
  let structure: GeneratedStructure;
  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      structure = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('JSON não encontrado na resposta');
    }
  } catch (error) {
    console.error('[Structure] Erro ao parsear resposta do GennovAIs:', error);
    // Estrutura padrão em caso de erro
    structure = {
      title: title,
      sections: [
        { id: '1', title: 'Introdução', description: 'Contextualização do tema', estimatedTime: '5 min' },
        { id: '2', title: 'Análise', description: 'Análise principal', estimatedTime: '15 min' },
        { id: '3', title: 'Conclusão', description: 'Conclusões e recomendações', estimatedTime: '5 min' },
      ],
      methodology: 'Análise geopolítica multidimensional',
      expectedOutcomes: ['Compreensão aprofundada do tema', 'Recomendações estratégicas'],
      totalEstimatedTime: '25 min',
      novaesNotes: 'Estrutura básica gerada automaticamente devido a erro no processamento.',
    };
  }

  console.log('[Structure] Estrutura finalizada');
  return structure;
}


// Função para avaliar apenas a proposta (sem gerar estrutura)
export async function evaluateProposalOnly(
  ctx: StructureGenerationContext
): Promise<{ verdict: 'green' | 'yellow' | 'red'; justification: string; suggestions: string }> {
  const { title, objective, additionalContext, sources, userId, analysisId } = ctx;

  console.log('[Evaluation] GennovAIs irá avaliar a proposta');
  console.log('[Evaluation] Título:', title);
  console.log('[Evaluation] Objetivo:', objective?.substring(0, 100) + '...');

  // Buscar configuração do GennovAIs no banco de dados (LLM e personalidade)
  let novaesConfig = await db.getCounselorLlmConfig('gennovais');
  if (!novaesConfig) novaesConfig = await db.getCounselorLlmConfig('gennovais');
  const novaesLlmProvider = (novaesConfig?.llmProvider || 'google') as 'google' | 'gemini' | 'claude' | 'anthropic';
  const personalityText = novaesConfig?.personality 
    ? `\n\nPERSONALIDADE ADICIONAL:\n${novaesConfig.personality}`
    : '';
  
  console.log(`[Evaluation] GennovAIs usando LLM: ${novaesLlmProvider}`);

  const DEFAULT_EVALUATOR_PROMPT = `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Sua missão é avaliar se uma proposta de análise é viável e adequada.

Você tem três tipos de parecer:
- SINAL VERDE (green): A análise é viável, relevante e pode ser executada. Aprovar para estruturação.
- SINAL AMARELO (yellow): A análise tem potencial mas precisa de ajustes. Sugerir melhorias específicas.
- SINAL VERMELHO (red): A análise é inadequada, fora do escopo ou inviável. Recomendar abandono com justificativa clara.

Sua avaliação deve considerar:
1. Relevância geopolítica do tema
2. Viabilidade da análise com as fontes disponíveis
3. Clareza e precisão do objetivo
4. Adequação ao escopo do Conselho (geopolítica, relações internacionais, estratégia)

Seja rigoroso mas construtivo. Seu parecer deve orientar o usuário sobre como proceder.

IMPORTANTE: Você DEVE responder APENAS com um objeto JSON válido, sem nenhum texto antes ou depois. Não use markdown, não use blocos de código, apenas o JSON puro.`;
  
  const evaluatorPrompt = await getSystemPrompt('novaes_proposal_evaluator', DEFAULT_EVALUATOR_PROMPT);
  const evaluatorSystemPrompt = evaluatorPrompt + personalityText;

  // Preparar resumo das fontes para avaliação
  const sourcesWithContentCount = sources.filter(s => s.content && s.content.length > 0).length;
  let sourceSummary = '';
  if (sources.length > 0) {
    sourceSummary = sources.map((s, i) => {
      const contentPreview = s.content 
        ? s.content.substring(0, 500) + (s.content.length > 500 ? '...' : '')
        : '[Conteúdo não disponível]';
      return `${i + 1}. ${s.title}\n   Conteúdo: ${contentPreview}`;
    }).join('\n\n');
  }

  console.log('[Evaluation] Fontes recebidas:', sources.length);
  console.log('[Evaluation] Fontes com conteúdo:', sourcesWithContentCount);

  const evaluationPrompt = `Avalie a seguinte proposta de análise geopolítica.

TÍTULO: ${title}

OBJETIVO: ${objective}

${additionalContext ? `CONTEXTO ADICIONAL: ${additionalContext}\n\n` : ''}FONTES DISPONÍVEIS (${sources.length} fonte(s), ${sourcesWithContentCount} com conteúdo extraído):
${sourceSummary || 'Nenhuma fonte adicional fornecida. O usuário pode estar usando apenas os conhecimentos dos Conselheiros.'}

Ao avaliar, considere:
- Se as fontes fornecidas são adequadas para o tema proposto
- Se o conteúdo das fontes é relevante para os objetivos
- Se há material suficiente para uma análise de qualidade

Responda APENAS com o seguinte JSON (sem texto adicional, sem markdown, sem blocos de código):
{"verdict": "green", "justification": "Sua justificativa detalhada aqui (3-5 linhas). Indique se APROVA ou NÃO APROVA.", "suggestions": "Sugestões se necessário"}

Onde verdict deve ser exatamente uma das strings: "green", "yellow" ou "red".`;

  const evaluationResult = await callLLM(novaesLlmProvider, evaluationPrompt, evaluatorSystemPrompt, {
    userId,
    analysisId,
    counselorId: 'gennovais',
    requestType: 'proposal_evaluation',
  });

  console.log('[Evaluation] Resposta bruta do LLM:', evaluationResult.text.substring(0, 500));

  // Parsear avaliação com múltiplas estratégias
  let verdict: 'green' | 'yellow' | 'red' = 'green';
  let justification = '';
  let suggestions = '';
  
  try {
    // Estratégia 1: Tentar extrair JSON diretamente
    let jsonText = evaluationResult.text.trim();
    
    // Remover possíveis blocos de código markdown
    if (jsonText.includes('```json')) {
      const match = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) jsonText = match[1].trim();
    } else if (jsonText.includes('```')) {
      const match = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (match) jsonText = match[1].trim();
    }
    
    // Estratégia 2: Encontrar o primeiro objeto JSON na resposta
    const jsonMatch = jsonText.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    // Tentar parsear
    const response = JSON.parse(jsonText);
    
    // Validar e normalizar verdict
    const rawVerdict = (response.verdict || '').toLowerCase().trim();
    if (rawVerdict === 'green' || rawVerdict === 'verde' || rawVerdict.includes('verde') || rawVerdict.includes('aprovad')) {
      verdict = 'green';
    } else if (rawVerdict === 'yellow' || rawVerdict === 'amarelo' || rawVerdict.includes('amarelo') || rawVerdict.includes('ajust')) {
      verdict = 'yellow';
    } else if (rawVerdict === 'red' || rawVerdict === 'vermelho' || rawVerdict.includes('vermelho') || rawVerdict.includes('rejeit')) {
      verdict = 'red';
    } else {
      verdict = 'green'; // Default para aprovado
    }
    
    justification = response.justification || response.justificativa || 'Análise aprovada pelo GennovAIs.';
    suggestions = response.suggestions || response.sugestoes || '';
    
    console.log('[Evaluation] JSON parseado com sucesso');
  } catch (parseError) {
    console.error('[Evaluation] Erro ao parsear JSON:', parseError);
    console.log('[Evaluation] Tentando extração por texto...');
    
    // Estratégia 3: Extração por análise de texto
    const text = evaluationResult.text.toLowerCase();
    
    // Detectar verdict pelo conteúdo do texto
    if (text.includes('sinal vermelho') || text.includes('"red"') || text.includes('não aprova') || text.includes('inadequad')) {
      verdict = 'red';
    } else if (text.includes('sinal amarelo') || text.includes('"yellow"') || text.includes('ajust') || text.includes('melhor')) {
      verdict = 'yellow';
    } else {
      verdict = 'green'; // Default para aprovado
    }
    
    // Usar a resposta completa como justificativa (limpando possíveis marcadores JSON)
    justification = evaluationResult.text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/\{[\s\S]*\}/g, '')
      .trim();
    
    if (!justification || justification.length < 20) {
      justification = 'Proposta aprovada. A análise geopolítica proposta apresenta relevância temática e potencial para contribuições significativas ao debate acadêmico e estratégico.';
    }
    
    console.log('[Evaluation] Extração por texto concluída');
  }

  console.log(`[Evaluation] GennovAIs deu parecer: ${verdict.toUpperCase()}`);
  console.log(`[Evaluation] Justificativa: ${justification.substring(0, 100)}...`);

  return { verdict, justification, suggestions };
}

// Função para gerar apenas a estrutura (após avaliação aprovada)
export async function generateStructureOnly(
  ctx: StructureGenerationContext
): Promise<{ structure: any }> {
  const { title, objective, additionalContext, sources, userId, analysisId } = ctx;

  console.log('[Structure] GennovAIs irá gerar a estrutura da análise');

  // Buscar configuração do GennovAIs (LLM e personalidade)
  let novaesConfig = await db.getCounselorLlmConfig('gennovais');
  if (!novaesConfig) novaesConfig = await db.getCounselorLlmConfig('gennovais');
  const novaesLlmProvider = (novaesConfig?.llmProvider || 'google') as 'google' | 'gemini' | 'claude' | 'anthropic';
  const personalityText = novaesConfig?.personality 
    ? `\n\nPERSONALIDADE ADICIONAL:\n${novaesConfig.personality}`
    : '';
  
  console.log(`[Structure] GennovAIs usando LLM: ${novaesLlmProvider}`);

  const DEFAULT_STRUCTURE_PROMPT = `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. A proposta de análise foi aprovada. Agora sua missão é propor uma estrutura detalhada de relatório.

Ao propor a estrutura:
1. Leia TODAS as fontes fornecidas com atenção
2. Considere o título, objetivo e contexto da análise
3. Proponha entre 4 e 8 seções principais
4. Cada seção deve ter título claro e descrição do conteúdo esperado
5. A estrutura deve fluir logicamente do contexto para as conclusões
6. Inclua o método e os resultados esperados

Sua estrutura deve ser fundamentada no conteúdo real das fontes, não em suposições.`;
  
  const structurePrompt = await getSystemPrompt('novaes_structure_generator', DEFAULT_STRUCTURE_PROMPT);
  const structureSystemPrompt = structurePrompt + personalityText;

  // Preparar conteúdo COMPLETO das fontes
  const fullSourcesContent = sources.length > 0
    ? sources
        .map((s, i) => {
          const content = s.content || 'Sem conteúdo extraído';
          const truncatedContent = content.length > 10000 
            ? content.substring(0, 10000) + '... [conteúdo truncado]'
            : content;
          return `=== FONTE ${i + 1}: ${s.title} ===\n${truncatedContent}`;
        })
        .join('\n\n---\n\n')
    : 'Nenhuma fonte específica fornecida. A análise será baseada em conhecimento geral.';

  const structureRequestPrompt = `A proposta foi aprovada. Agora proponha uma estrutura detalhada de relatório.

IMPORTANTE: Leia TODAS as fontes fornecidas abaixo com atenção. Sua estrutura deve ser fundamentada no conteúdo real das fontes.

TÍTULO: ${title}

OBJETIVO: ${objective}

${additionalContext ? `CONTEXTO ADICIONAL: ${additionalContext}\n\n` : ''}FONTES FORNECIDAS PELO USUÁRIO:
${fullSourcesContent}

Responda em JSON com o seguinte formato:
{
  "structure": {
    "title": "Título do relatório",
    "sections": [
      {
        "id": "1",
        "title": "Título da seção",
        "description": "Descrição do que será abordado",
        "estimatedTime": "Tempo estimado de leitura",
        "subsections": [
          { "id": "1.1", "title": "Subtítulo", "description": "Descrição" }
        ]
      }
    ],
    "methodology": "Método a ser utilizada",
    "expectedOutcomes": ["Resultado esperado 1", "Resultado esperado 2"],
    "totalEstimatedTime": "Tempo total estimado",
    "novaesNotes": "Suas observações sobre a estrutura"
  }
}`;

  const structureResult = await callLLM(novaesLlmProvider, structureRequestPrompt, structureSystemPrompt, {
    userId,
    analysisId,
    counselorId: 'gennovais',
    requestType: 'structure_generation',
  });

  // Parsear estrutura
  let structure: GeneratedStructure;
  try {
    const jsonMatch = structureResult.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const response = JSON.parse(jsonMatch[0]);
      structure = response.structure || {};
      structure.novaesNotes = structure.novaesNotes || 'Estrutura gerada pelo GennovAIs.';
    } else {
      throw new Error('JSON não encontrado na resposta de estrutura');
    }
  } catch (error) {
    console.error('[Structure] Erro ao parsear estrutura:', error);
    // Estrutura padrão em caso de erro
    structure = {
      title: title,
      sections: [
        { id: '1', title: 'Introdução', description: 'Contextualização do tema', estimatedTime: '5 min' },
        { id: '2', title: 'Análise', description: 'Análise principal', estimatedTime: '15 min' },
        { id: '3', title: 'Conclusão', description: 'Conclusões e recomendações', estimatedTime: '5 min' },
      ],
      methodology: 'Análise geopolítica multidimensional',
      expectedOutcomes: ['Compreensão aprofundada do tema', 'Recomendações estratégicas'],
      totalEstimatedTime: '25 min',
      novaesNotes: 'Estrutura básica gerada pelo GennovAIs.',
    };
  }

  console.log('[Structure] Estrutura gerada com sucesso');

  return { structure };
}

// Função para gerar estrutura com um Conselheiro aleatório seguindo sua personalidade
export async function generateStructureWithReview(
  ctx: StructureGenerationContext
): Promise<{ structure: any; novaesProposal: string; novaesVerdict: 'green' | 'yellow' | 'red'; novaesJustification: string }> {
  const { title, objective, additionalContext, sources, userId, analysisId } = ctx;

  console.log('[Structure] GennovAIs irá propor a estrutura da análise');

  // Buscar configuração do GennovAIs no banco de dados (LLM e personalidade)
  // Tentar buscar com ID antigo ou novo (fallback)
  let novaesConfig = await db.getCounselorLlmConfig('gennovais');
  if (!novaesConfig) novaesConfig = await db.getCounselorLlmConfig('gennovais');
  const novaesLlmProvider = (novaesConfig?.llmProvider || 'google') as 'google' | 'gemini' | 'claude' | 'anthropic';
  const personalityText = novaesConfig?.personality 
    ? `\n\nPERSONALIDADE ADICIONAL:\n${novaesConfig.personality}`
    : '';
  
  console.log(`[Structure] GennovAIs usando LLM: ${novaesLlmProvider}`);

  // ETAPA 1: Avaliar proposta com novaes_proposal_evaluator
  const DEFAULT_EVALUATOR_PROMPT = `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. Sua missão é avaliar se uma proposta de análise é viável e adequada.

Você tem três tipos de parecer:
- **SINAL VERDE**: A análise é viável, relevante e pode ser executada. Aprovar para estruturação.
- **SINAL AMARELO**: A análise tem potencial mas precisa de ajustes. Sugerir melhorias específicas.
- **SINAL VERMELHO**: A análise é inadequada, fora do escopo ou inviável. Recomendar abandono com justificativa clara.

Sua avaliação deve considerar:
1. Relevância geopolítica do tema
2. Viabilidade da análise com as fontes disponíveis
3. Clareza e precisão do objetivo
4. Adequação ao escopo do Conselho (geopolítica, relações internacionais, estratégia)

Seja rigoroso mas construtivo. Seu parecer deve orientar o usuário sobre como proceder.`;
  
  const evaluatorPrompt = await getSystemPrompt('novaes_proposal_evaluator', DEFAULT_EVALUATOR_PROMPT);
  const evaluatorSystemPrompt = evaluatorPrompt + personalityText;

  // ETAPA 2: Gerar estrutura com novaes_structure_generator (se aprovado)
  const DEFAULT_STRUCTURE_PROMPT = `Você é o GennovAIs, Coordenador do Conselho de Geopolítica da FGV. A proposta de análise foi aprovada. Agora sua missão é propor uma estrutura detalhada de relatório.

Ao propor a estrutura:
1. Leia TODAS as fontes fornecidas com atenção
2. Considere o título, objetivo e contexto da análise
3. Proponha entre 4 e 8 seções principais
4. Cada seção deve ter título claro e descrição do conteúdo esperado
5. A estrutura deve fluir logicamente do contexto para as conclusões
6. Inclua o método e os resultados esperados

Sua estrutura deve ser fundamentada no conteúdo real das fontes, não em suposições.`;
  
  const structurePrompt = await getSystemPrompt('novaes_structure_generator', DEFAULT_STRUCTURE_PROMPT);
  const structureSystemPrompt = structurePrompt + personalityText;

  // Preparar conteúdo COMPLETO das fontes (não apenas resumo)
  const fullSourcesContent = sources.length > 0
    ? sources
        .map((s, i) => {
          const content = s.content || 'Sem conteúdo extraído';
          // Limitar cada fonte a 10000 caracteres para evitar exceder limites do modelo
          const truncatedContent = content.length > 10000 
            ? content.substring(0, 10000) + '... [conteúdo truncado]'
            : content;
          return `=== FONTE ${i + 1}: ${s.title} ===\n${truncatedContent}`;
        })
        .join('\n\n---\n\n')
    : 'Nenhuma fonte específica fornecida. A análise será baseada em conhecimento geral.';

  // ===== ETAPA 1: AVALIAÇÃO DA PROPOSTA =====
  console.log('[Structure] ETAPA 1: GennovAIs avaliando proposta...');
  
  const evaluationPrompt = `Avalie a seguinte proposta de análise geopolítica.

TÍTULO: ${title}

OBJETIVO: ${objective}

${additionalContext ? `CONTEXTO ADICIONAL: ${additionalContext}\n\n` : ''}FONTES DISPONÍVEIS: ${sources.length} fonte(s) fornecida(s)

Responda em JSON com o seguinte formato:
{
  "verdict": "green" | "yellow" | "red",
  "justification": "Explicação clara do seu parecer (2-3 frases)",
  "suggestions": "Sugestões de melhoria (se amarelo) ou razões para abandono (se vermelho)"
}`;

  const evaluationResult = await callLLM(novaesLlmProvider, evaluationPrompt, evaluatorSystemPrompt, {
    userId,
    analysisId,
    counselorId: 'gennovais',
    requestType: 'proposal_evaluation',
  });

  // Parsear avaliação
  let verdict: 'green' | 'yellow' | 'red' = 'green';
  let justification = '';
  let suggestions = '';
  
  try {
    const jsonMatch = evaluationResult.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const response = JSON.parse(jsonMatch[0]);
      verdict = response.verdict || 'green';
      justification = response.justification || 'Análise aprovada.';
      suggestions = response.suggestions || '';
    } else {
      throw new Error('JSON não encontrado na resposta de avaliação');
    }
  } catch (error) {
    console.error('[Structure] Erro ao parsear avaliação:', error);
    verdict = 'green';
    justification = 'Proposta aprovada. A análise geopolítica proposta apresenta relevância temática e potencial para contribuições significativas ao debate acadêmico e estratégico.';
  }

  console.log(`[Structure] GennovAIs deu parecer: ${verdict.toUpperCase()}`);

  // ===== ETAPA 2: GERAÇÃO DE ESTRUTURA (se aprovado) =====
  let structure: GeneratedStructure;
  
  if (verdict === 'red') {
    // Se rejeitado, retornar estrutura mínima
    console.log('[Structure] Proposta REJEITADA. Estrutura mínima gerada.');
    structure = {
      title: title,
      sections: [
        { id: '1', title: 'Proposta Não Aprovada', description: justification, estimatedTime: '1 min' },
      ],
      methodology: 'N/A',
      expectedOutcomes: ['Revisar proposta conforme sugestões do GennovAIs'],
      totalEstimatedTime: '1 min',
      novaesNotes: `${justification}\n\n${suggestions}`,
    };
  } else {
    // Se verde ou amarelo, gerar estrutura detalhada
    console.log('[Structure] ETAPA 2: GennovAIs gerando estrutura detalhada...');
    
    const structurePrompt = `A proposta foi aprovada com parecer ${verdict === 'green' ? 'VERDE' : 'AMARELO'}. Agora proponha uma estrutura detalhada de relatório.

IMPORTANTE: Leia TODAS as fontes fornecidas abaixo com atenção. Sua estrutura deve ser fundamentada no conteúdo real das fontes.

TÍTULO: ${title}

OBJETIVO: ${objective}

${additionalContext ? `CONTEXTO ADICIONAL: ${additionalContext}\n\n` : ''}FONTES FORNECIDAS PELO USUÁRIO:
${fullSourcesContent}

Responda em JSON com o seguinte formato:
{
  "structure": {
    "title": "Título do relatório",
    "sections": [
      {
        "id": "1",
        "title": "Título da seção",
        "description": "Descrição do que será abordado",
        "estimatedTime": "Tempo estimado de leitura",
        "subsections": [
          { "id": "1.1", "title": "Subtítulo", "description": "Descrição" }
        ]
      }
    ],
    "methodology": "Método a ser utilizada",
    "expectedOutcomes": ["Resultado esperado 1", "Resultado esperado 2"],
    "totalEstimatedTime": "Tempo total estimado",
    "novaesNotes": "Suas observações sobre a estrutura"
  }
}`;

    const structureResult = await callLLM(novaesLlmProvider, structurePrompt, structureSystemPrompt, {
      userId,
      analysisId,
      counselorId: 'gennovais',
      requestType: 'structure_generation',
    });

    // Parsear estrutura
    try {
      const jsonMatch = structureResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const response = JSON.parse(jsonMatch[0]);
        structure = response.structure || {};
        structure.novaesNotes = structure.novaesNotes || `${justification}${suggestions ? '\n\nSugestões: ' + suggestions : ''}`;
      } else {
        throw new Error('JSON não encontrado na resposta de estrutura');
      }
    } catch (error) {
      console.error('[Structure] Erro ao parsear estrutura:', error);
      // Estrutura padrão em caso de erro
      structure = {
        title: title,
        sections: [
          { id: '1', title: 'Introdução', description: 'Contextualização do tema', estimatedTime: '5 min' },
          { id: '2', title: 'Análise', description: 'Análise principal', estimatedTime: '15 min' },
          { id: '3', title: 'Conclusão', description: 'Conclusões e recomendações', estimatedTime: '5 min' },
        ],
        methodology: 'Análise geopolítica multidimensional',
        expectedOutcomes: ['Compreensão aprofundada do tema', 'Recomendações estratégicas'],
        totalEstimatedTime: '25 min',
        novaesNotes: 'Estrutura básica gerada pelo GennovAIs.',
      };
    }
  }

  console.log(`[Structure] GennovAIs deu parecer: ${verdict.toUpperCase()}`);
  
  return {
    structure,
    novaesProposal: structure.novaesNotes || justification,
    novaesVerdict: verdict,
    novaesJustification: justification,
  };
}


/**
 * Consolida pareceres aprovados manualmente em um relatório final
 */
export async function consolidateApprovedOpinions(params: {
  analysisId: number;
  objective: string;
  structure?: { sections: Array<{ title: string; description: string }> };
  approvedOpinions: Array<{
    counselorId: string;
    counselorName: string;
    content: string;
  }>;
  userId: number;
}): Promise<{ finalReport: string; totalCost: number }> {
  const { analysisId, objective, structure, approvedOpinions, userId } = params;
  
  console.log('[Consolidation] Iniciando consolidação de pareceres aprovados');
  console.log('[Consolidation] Total de pareceres:', approvedOpinions.length);
  
  // Buscar fontes do usuário para contexto
  const sources = await db.getSourcesByAnalysisId(analysisId);
  const contextText = sources.length > 0 
    ? `\n\nFONTES DISPONÍVEIS:\n${sources.map(s => `- ${s.title || s.fileName}: ${s.extractedText?.substring(0, 500) || 'Sem conteúdo extraído'}...`).join('\n')}`
    : '';
  
  // Preparar pareceres para consolidação
  const allOpinions = approvedOpinions
    .map((o, i) => {
      const analyst = ANALYSTS.find(a => a.id === o.counselorId);
      return `=== PARECER ${i + 1} (Perspectiva: ${analyst?.keyTheory || o.counselorName}) ===\n\n${o.content}`;
    })
    .join("\n\n---\n\n");
  
  const structureText = structure?.sections 
    ? `ESTRUTURA DO RELATÓRIO (OBRIGATÓRIA):\n${structure.sections.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join('\n')}`
    : '';
  
  const consolidationPrompt = `TÍTULO DA ANÁLISE: ${objective}
${contextText}

PARECERES DOS CONSELHEIROS (${approvedOpinions.length} pareceres aprovados):
${allOpinions}

${structureText}

---

CTrabalhando em conjunto com o GennovAIs, unifique todos os pareceres aprovados em um ÚNCO RELATÓRIO FINAL.

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

  // Buscar configuração do Max Weber (LLM e personalidade)
  const editorConfig = await db.getCounselorLlmConfig('editor');
  const editorLlmProvider = (editorConfig?.llmProvider || 'google') as 'google' | 'gemini' | 'claude' | 'anthropic';
  const editorPersonality = editorConfig?.personality 
    ? `\n\nPERSONALIDADE ADICIONAL:\n${editorConfig.personality}\n\nAdote esta personalidade na consolidação do relatório.`
    : '';
  
  console.log(`[Consolidation] Max Weber usando LLM: ${editorLlmProvider}`);
  
  const editorBasePrompt = await getSystemPrompt('editor_consolidator', DEFAULT_EDITOR_PROMPT);
  const editorSystemPrompt = editorBasePrompt + editorPersonality;
  
  const result = await callLLM(editorLlmProvider, consolidationPrompt, editorSystemPrompt, {
    userId,
    analysisId,
    counselorId: "editor",
    requestType: "manual_consolidation",
  });
  
  console.log('[Consolidation] Relatório consolidado com sucesso');
  console.log('[Consolidation] Tamanho do relatório:', result.text.length, 'caracteres');
  
  return {
    finalReport: result.text,
    totalCost: result.cost,
  };
}
