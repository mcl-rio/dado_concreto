import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("Testando Gemini 2.5 Pro com 8192 tokens...");

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: "Responda apenas: OK" }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  }
);

const data = await response.json();
console.log("Resposta completa:", JSON.stringify(data, null, 2));
