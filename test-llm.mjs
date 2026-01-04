import { invokeLLM } from './server/_core/llm.ts';

async function testLLM() {
  try {
    console.log('Testando chamada LLM...');
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: 'Você é um assistente útil.' },
        { role: 'user', content: 'Diga apenas "Olá"' }
      ]
    });
    console.log('Resposta:', response.choices[0]?.message?.content);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testLLM();
