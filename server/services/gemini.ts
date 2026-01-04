import { ENV } from '../_core/env';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
      role: string;
    };
    finishReason: string;
  }[];
}

export async function invokeGemini(prompt: string, systemPrompt?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  const contents: GeminiMessage[] = [];
  
  if (systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: `Instruções do sistema: ${systemPrompt}` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Entendido. Seguirei essas instruções.' }]
    });
  }
  
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro na API Gemini: ${error}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Nenhuma resposta gerada pelo Gemini');
  }

  return data.candidates[0].content.parts[0].text;
}

export interface AnalysisContext {
  title: string;
  topic?: string;
  objective: string;
  additionalContext?: string;
  sources: string[];
}

export async function generateAnalysisStructure(context: AnalysisContext): Promise<object> {
  const systemPrompt = `Você é um especialista renomado em geopolítica, com profundo conhecimento das principais teorias geopolíticas clássicas e contemporâneas. Sua tarefa é analisar o material fornecido e propor uma estrutura de relatório geopolítico profissional e acadêmico. Responda sempre em JSON válido.`;
  
  const prompt = `
Você recebeu a seguinte solicitação de análise geopolítica:

**TÍTULO:** ${context.title}

**TEMA:** ${context.topic || 'Não especificado'}

**OBJETIVO:** ${context.objective}

**CONTEXTO ADICIONAL:** ${context.additionalContext || 'Nenhum contexto adicional fornecido'}

**FONTES DISPONÍVEIS:**
${context.sources.length > 0 ? context.sources.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'Nenhuma fonte adicional fornecida'}

Com base nessas informações, crie uma estrutura de análise geopolítica profissional que reflita diretamente o título, tema, objetivo e contexto fornecidos.

Retorne um JSON com o seguinte formato:
{
  "title": "Título do relatório (baseado no título fornecido)",
  "sections": [
    {
      "id": "1",
      "title": "Título da seção",
      "description": "Breve descrição do conteúdo a ser desenvolvido",
      "estimatedTime": "Tempo estimado em minutos para esta seção",
      "subsections": [
        {
          "id": "1.1",
          "title": "Subtítulo",
          "description": "Descrição do conteúdo"
        }
      ]
    }
  ],
  "methodology": "Descrição do método de análise a ser utilizado",
  "expectedOutcomes": ["Resultado esperado 1", "Resultado esperado 2"],
  "totalEstimatedTime": "Tempo total estimado em minutos"
}

A estrutura deve ser personalizada para o tema específico e incluir seções relevantes como:
- Introdução e Contextualização
- Contexto Histórico (se aplicável)
- Análise dos Atores Envolvidos
- Interesses Geopolíticos em Jogo
- Análise Estratégica
- Cenários Possíveis
- Implicações para o Brasil
- Conclusões e Recomendações

Adapte as seções ao tema específico da análise.
`;

  const response = await invokeGemini(prompt, systemPrompt);
  
  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Resposta do Gemini não contém JSON válido');
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function generateReportStructure(analysisStructure: object): Promise<object> {
  const systemPrompt = `Você é um especialista em formatação de relatórios acadêmicos e profissionais. Responda sempre em JSON válido.`;
  
  const prompt = `
Com base na seguinte estrutura de análise:
${JSON.stringify(analysisStructure, null, 2)}

Crie uma estrutura de relatório profissional. Retorne um JSON com o seguinte formato:
{
  "format": {
    "pageSize": "A4",
    "margins": { "top": "2.5cm", "bottom": "2.5cm", "left": "3cm", "right": "2cm" },
    "lineSpacing": 1.5
  },
  "header": {
    "includeTitle": true,
    "includeDate": true,
    "includeLogo": true
  },
  "footer": {
    "includePageNumber": true,
    "includeAuthor": false
  },
  "sections": [
    {
      "type": "cover",
      "title": "Capa",
      "elements": ["title", "subtitle", "date", "author"]
    },
    {
      "type": "toc",
      "title": "Sumário"
    },
    {
      "type": "executive_summary",
      "title": "Resumo Executivo",
      "maxWords": 500
    },
    {
      "type": "content",
      "title": "Conteúdo Principal",
      "followsAnalysisStructure": true
    },
    {
      "type": "references",
      "title": "Referências"
    }
  ],
  "styling": {
    "headingStyle": "numbered",
    "citationStyle": "ABNT",
    "tableStyle": "bordered"
  }
}
`;

  const response = await invokeGemini(prompt, systemPrompt);
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Resposta do Gemini não contém JSON válido');
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function generateFullAnalysis(
  objective: string,
  analysisStructure: object,
  sources: { type: string; title: string; content: string }[]
): Promise<string> {
  const systemPrompt = `Você é um analista geopolítico sênior com vasta experiência em análises estratégicas. 
Produza análises profundas, bem fundamentadas e com rigor acadêmico. 
Use linguagem formal e técnica apropriada para relatórios institucionais.
Cite as fontes quando apropriado.
Estruture o texto com parágrafos bem desenvolvidos, evitando listas de bullet points excessivas.`;

  const sourcesText = sources.map(s => `
--- FONTE: ${s.title} (${s.type}) ---
${s.content.substring(0, 5000)}
${s.content.length > 5000 ? '... [conteúdo truncado]' : ''}
`).join('\n\n');

  const prompt = `
OBJETIVO DA ANÁLISE:
${objective}

ESTRUTURA A SEGUIR:
${JSON.stringify(analysisStructure, null, 2)}

FONTES DISPONÍVEIS:
${sourcesText}

Com base nas fontes fornecidas e seguindo a estrutura definida, produza uma análise geopolítica completa e profissional.

A análise deve:
1. Ser objetiva e baseada em evidências das fontes
2. Apresentar múltiplas perspectivas quando relevante
3. Identificar padrões, tendências e implicações
4. Oferecer conclusões fundamentadas
5. Usar formatação Markdown para estruturar o texto

Produza o texto completo da análise:
`;

  return invokeGemini(prompt, systemPrompt);
}

export async function suggestAnalysisObjectives(topic: string): Promise<string[]> {
  const systemPrompt = `Você é um consultor especializado em análises geopolíticas. Responda em JSON.`;
  
  const prompt = `
O usuário quer fazer uma análise geopolítica sobre: "${topic}"

Sugira 5 objetivos de análise específicos e bem formulados que poderiam ser explorados.
Retorne um JSON no formato:
{
  "suggestions": [
    "Objetivo 1",
    "Objetivo 2",
    "Objetivo 3",
    "Objetivo 4",
    "Objetivo 5"
  ]
}
`;

  const response = await invokeGemini(prompt, systemPrompt);
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return [];
  }
  
  const data = JSON.parse(jsonMatch[0]);
  return data.suggestions || [];
}
