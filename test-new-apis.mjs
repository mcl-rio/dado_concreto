// Testar APIs com as novas chaves
const GEMINI_KEY = "AQ.Ab8RN6KHXZk6Gkzz9JgGx7k0IkwNiZmKBIcTZioYtI8TPcW0dw";
const CLAUDE_KEY = "AQ.Ab8RN6KJSI9iw_NMntBB83eOTJLaY6Zi6m_dHk9pBJA7lfjiQw";

console.log("=== Testando APIs com novas chaves ===\n");

// Teste Gemini 2.5 Pro
console.log("1. Testando Gemini 2.5 Pro...");
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
