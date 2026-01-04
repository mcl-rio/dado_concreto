import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGenerateStructure() {
  console.log("Testing Gemini 3 Pro Preview for structure generation...");
  console.log("API Key present:", !!GEMINI_API_KEY);
  
  const prompt = `Você é um especialista em geopolítica. Proponha uma estrutura de relatório para analisar:
Título: Teste de Análise
Objetivo: Analisar as relações Brasil-China
Contexto: Contexto de teste

Responda em JSON com o formato:
{
  "sections": [{"title": "string", "description": "string"}],
  "methodology": "string",
  "expectedResults": "string",
  "observations": "string"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const data = await response.json();
    console.log("Response status:", response.status);
    
    if (data.error) {
      console.log("Error:", JSON.stringify(data.error, null, 2));
    } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log("Success! Response length:", data.candidates[0].content.parts[0].text.length);
      console.log("First 500 chars:", data.candidates[0].content.parts[0].text.substring(0, 500));
    } else {
      console.log("Unexpected response:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log("Fetch error:", error.message);
  }
}

testGenerateStructure();
