import 'dotenv/config';

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;

console.log("=== Testando APIs com chaves do ambiente ===\n");
console.log("Gemini Key:", GEMINI_KEY ? GEMINI_KEY.substring(0, 10) + "..." : "NÃO CONFIGURADA");
console.log("Claude Key:", CLAUDE_KEY ? CLAUDE_KEY.substring(0, 15) + "..." : "NÃO CONFIGURADA");

// Teste Gemini 2.5 Pro
console.log("\n1. Testando Gemini 2.5 Pro...");
try {
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Responda apenas: OK" }] }],
        generationConfig: { temperature: 1.0, maxOutputTokens: 100 },
      }),
    }
  );
  const geminiData = await geminiResponse.json();
  if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.log("✅ Gemini 2.5 Pro: OK");
  } else {
    console.log("❌ Gemini 2.5 Pro:", geminiData.error?.message || JSON.stringify(geminiData));
  }
} catch (error) {
  console.log("❌ Gemini 2.5 Pro:", error.message);
}

// Teste Claude Sonnet 4
console.log("\n2. Testando Claude Sonnet 4...");
try {
  const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{ role: "user", content: "Responda apenas: OK" }],
    }),
  });
  const claudeData = await claudeResponse.json();
  if (claudeData.content?.[0]?.text) {
    console.log("✅ Claude Sonnet 4: OK");
  } else {
    console.log("❌ Claude Sonnet 4:", claudeData.error?.message || JSON.stringify(claudeData));
  }
} catch (error) {
  console.log("❌ Claude Sonnet 4:", error.message);
}

console.log("\n=== Teste concluído ===");
