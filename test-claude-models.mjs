import 'dotenv/config';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Modelos Claude para testar
const models = [
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-latest",
  "claude-3-opus-20240229",
  "claude-sonnet-4-20250514",
  "claude-3-5-haiku-20241022",
];

console.log("Testando modelos Claude disponíveis...\n");

for (const model of models) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 10,
        messages: [{ role: "user", content: "OK" }],
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ ${model}: OK`);
    } else {
      console.log(`❌ ${model}: ${data.error?.message || 'Erro'}`);
    }
  } catch (error) {
    console.log(`❌ ${model}: ${error.message}`);
  }
}
