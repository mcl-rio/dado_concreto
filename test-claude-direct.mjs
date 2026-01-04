import 'dotenv/config';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

console.log("Testando Claude Opus 4.5...");
console.log("API Key:", ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 15) + "..." : "NÃO CONFIGURADA");

try {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5-20250514",
      max_tokens: 100,
      temperature: 0.7,
      system: "Você é um assistente.",
      messages: [{ role: "user", content: "Responda apenas: OK" }],
    }),
  });

  console.log("Response status:", response.status);
  const data = await response.json();
  console.log("Resposta:", JSON.stringify(data, null, 2));
} catch (error) {
  console.error("Erro:", error);
}
