import 'dotenv/config';

// Simular a função generateStructureWithReview
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const GOLBERY_STRUCTURE_PROMPT = `Você é o General Golbery do Couto e Silva, estrategista geopolítico brasileiro.`;

const context = {
  title: "Análise das Relações Brasil-China",
  objective: "Analisar os impactos geopolíticos das relações comerciais entre Brasil e China",
  additionalContext: "Foco no período 2020-2024",
  sources: [{ title: "Fonte 1", content: "Conteúdo da fonte" }],
};

const sourcesText = context.sources.map((s, i) => {
  const preview = s.content ? s.content.substring(0, 500) : '';
  return `${i + 1}. ${s.title}${preview ? `\n   Preview: ${preview}` : ''}`;
}).join('\n');

const golberyPrompt = `
Analise a seguinte solicitação de análise geopolítica e proponha uma estrutura de relatório:

**TÍTULO:** ${context.title}

**OBJETIVO:** ${context.objective}

**CONTEXTO ADICIONAL:** ${context.additionalContext || 'Nenhum contexto adicional fornecido'}

**FONTES DISPONÍVEIS:**
${sourcesText}

Crie uma estrutura que reflita DIRETAMENTE o título e objetivo acima. Retorne um JSON com o seguinte formato:
{
  "title": "Título do relatório (baseado no título fornecido)",
  "sections": [
    {
      "id": "1",
      "title": "Título da seção",
      "description": "Breve descrição do conteúdo a ser desenvolvido",
      "estimatedTime": "Tempo estimado em minutos"
    }
  ],
  "methodology": "Descrição da metodologia de análise",
  "expectedOutcomes": ["Resultado esperado 1", "Resultado esperado 2"],
  "totalEstimatedTime": "Tempo total estimado em minutos",
  "golberyNotes": "Suas observações estratégicas sobre esta análise"
}

IMPORTANTE: 
- A última seção DEVE ser "Referências Bibliográficas" (padrão APA 7)
- Adapte as seções ao tema específico da análise
`;

console.log("Chamando Gemini 3 Pro Preview...");
console.log("Prompt length:", golberyPrompt.length);

try {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: GOLBERY_STRUCTURE_PROMPT + "\n\n" + golberyPrompt }] },
        ],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 16384,
        },
      }),
    }
  );

  console.log("Response status:", response.status);
  
  if (!response.ok) {
    const error = await response.text();
    console.log("ERRO:", error);
  } else {
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Resposta length:", text.length);
    console.log("Primeiros 1000 chars:", text.substring(0, 1000));
    
    // Tentar extrair JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log("\n✅ JSON encontrado!");
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("Seções:", parsed.sections?.length || 0);
      } catch (e) {
        console.log("❌ Erro ao parsear JSON:", e.message);
      }
    } else {
      console.log("❌ JSON não encontrado na resposta");
    }
  }
} catch (error) {
  console.log("Fetch error:", error.message);
}
