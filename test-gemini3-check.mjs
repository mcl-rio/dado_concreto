import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Testar Gemini 3 Pro Preview diretamente
console.log("Testando gemini-3-pro-preview...");

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Responda apenas: OK" }] }],
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 100,
      },
    }),
  }
);

console.log("Status:", response.status);
const data = await response.json();

if (data.error) {
  console.log("ERRO:", JSON.stringify(data.error, null, 2));
} else {
  console.log("SUCESSO:", data.candidates?.[0]?.content?.parts?.[0]?.text);
}
