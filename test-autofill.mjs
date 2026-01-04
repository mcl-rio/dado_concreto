import { invokeLLM } from './server/_core/llm.ts';

async function testAutoFill() {
  try {
    console.log('Testando geração de dados do conselheiro...');
    
    const systemPrompt = `Você é um especialista em geopolitica e relações internacionais. Dado o nome de um pensador geopolítico, gere um perfil completo para ele no formato JSON.

O perfil deve incluir:
- counselorId: identificador único em lowercase com hífens (ex: "hans-morgenthau")
- name: nome completo
- shortName: nome curto para exibição
- nationality: nacionalidade
- birthYear: ano de nascimento
- deathYear: ano de falecimento (null se vivo)
- mainTheory: principal teoria ou contribuição
- shortBio: biografia curta (1-2 frases)
- fullBio: biografia completa (3-5 parágrafos)
- keyContributions: array de 3-5 contribuições principais
- areasOfExpertise: array de 3-5 áreas de especialização
- mainBooks: array de 2-4 livros principais com {title, year, description}
- personalityTraits: array de 3-5 traços de personalidade
- writingStyle: descrição do estilo de escrita
- analysisApproach: como ele aborda análises geopolíticas
- keyPhrases: array de 2-4 frases características

Responda APENAS com o JSON válido, sem explicações adicionais.`;
    
    const response = await invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Gere o perfil completo para: Hans Morgenthau' }
      ],
      response_format: { type: 'json_object' }
    });
    
    const content = response.choices[0]?.message?.content;
    console.log('Conteúdo bruto:', typeof content, content?.substring(0, 200));
    
    if (content) {
      const parsed = JSON.parse(content);
      console.log('Dados parseados:', JSON.stringify(parsed, null, 2).substring(0, 500));
    }
  } catch (error) {
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAutoFill();
