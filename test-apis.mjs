// Script para testar APIs do Gemini 3 Pro e Claude Opus 4.5
import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

console.log("=== Teste de APIs ===\n");

// Teste 1: Gemini 3 Pro Preview
async function testGemini() {
  console.log("1. Testando Gemini 3 Pro Preview...");
  console.log(`   API Key: ${GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'NÃO CONFIGURADA'}`);
  
  if (!GEMINI_API_KEY) {
    console.log("   ❌ GEMINI_API_KEY não configurada\n");
    return false;
  }
  
  try {
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
            maxOutputTokens: 100,
          },
        }),
      }
    );
    
    const data = await response.json();
    
    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log(`   ✅ Gemini 3 Pro Preview respondeu: "${data.candidates[0].content.parts[0].text.trim()}"`);
      return true;
    } else {
      console.log(`   ❌ Erro Gemini: ${JSON.stringify(data.error || data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão Gemini: ${error.message}`);
    return false;
  }
}

// Teste 2: Claude Opus 4.5
async function testClaude() {
  console.log("\n2. Testando Claude Opus 4.5...");
  console.log(`   API Key: ${ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'NÃO CONFIGURADA'}`);
  
  if (!ANTHROPIC_API_KEY) {
    console.log("   ❌ ANTHROPIC_API_KEY não configurada\n");
    return false;
  }
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 100,
        messages: [
          { role: "user", content: "Responda apenas: OK" },
        ],
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.content?.[0]?.text) {
      console.log(`   ✅ Claude Opus 4.5 respondeu: "${data.content[0].text.trim()}"`);
      return true;
    } else {
      console.log(`   ❌ Erro Claude: ${JSON.stringify(data.error || data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão Claude: ${error.message}`);
    return false;
  }
}

// Teste 3: Verificar modelo Gemini disponível
async function listGeminiModels() {
  console.log("\n3. Listando modelos Gemini disponíveis...");
  
  if (!GEMINI_API_KEY) {
    console.log("   ❌ GEMINI_API_KEY não configurada\n");
    return;
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    const data = await response.json();
    
    if (response.ok && data.models) {
      console.log("   Modelos disponíveis:");
      data.models
        .filter(m => m.name.includes('gemini'))
        .slice(0, 10)
        .forEach(m => {
          console.log(`   - ${m.name} (${m.displayName})`);
        });
    } else {
      console.log(`   ❌ Erro ao listar modelos: ${JSON.stringify(data.error || data)}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
  }
}

// Executar testes
async function runTests() {
  const geminiOk = await testGemini();
  const claudeOk = await testClaude();
  await listGeminiModels();
  
  console.log("\n=== Resumo ===");
  console.log(`Gemini 3 Pro Preview: ${geminiOk ? '✅ OK' : '❌ FALHA'}`);
  console.log(`Claude Opus 4.5: ${claudeOk ? '✅ OK' : '❌ FALHA'}`);
}

runTests();
