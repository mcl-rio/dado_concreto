import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

console.log("=== Teste Completo de Geração de Estrutura ===\n");

// Etapa 1: Golbery (Gemini)
console.log("1. Chamando Golbery (Gemini 2.5 Pro)...");
const golberyPrompt = `Proponha uma estrutura de relatório para: "Análise das Relações Brasil-China 2020-2024"
Objetivo: Analisar os impactos comerciais e geopolíticos

Retorne um JSON com: title, sections (array com id, title, description), methodology, expectedOutcomes`;

const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: golberyPrompt }] }],
      generationConfig: { temperature: 1.0, maxOutputTokens: 8192 },
    }),
  }
);

const geminiData = await geminiResponse.json();
const golberyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
console.log("✅ Golbery respondeu:", golberyText.substring(0, 200) + "...\n");

// Etapa 2: Kissinger (Claude)
console.log("2. Chamando Kissinger (Claude Sonnet 4)...");
const kissingerPrompt = `Revise esta estrutura de relatório e confirme se está adequada:
${golberyText.substring(0, 1000)}

Retorne a estrutura revisada em JSON.`;

const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.7,
    messages: [{ role: "user", content: kissingerPrompt }],
  }),
});

const claudeData = await claudeResponse.json();
const kissingerText = claudeData.content?.[0]?.text || "";
console.log("✅ Kissinger respondeu:", kissingerText.substring(0, 200) + "...\n");

console.log("=== Teste Completo: SUCESSO ===");
