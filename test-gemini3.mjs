import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("Testando Gemini 3 Pro Preview (sem thinkingConfig)...");

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: "Responda apenas: OK" }] },
      ],
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 16384,
      },
    }),
  }
);

const data = await response.json();
console.log("Status:", response.status);
console.log("Resposta:", JSON.stringify(data, null, 2));
