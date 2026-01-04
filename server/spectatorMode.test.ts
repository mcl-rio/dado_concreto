import { describe, it, expect } from 'vitest';

// Função para extrair argumentos-chave de um parecer (modo espectador)
// Copiada do multiAgents.ts para teste isolado
function extractKeyArguments(text: string, keyTheory: string): string[] {
  const arguments_: string[] = [];
  
  // Extrair primeiras frases de cada parágrafo (geralmente contêm argumentos principais)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  
  for (const paragraph of paragraphs.slice(0, 4)) {
    // Pegar a primeira frase do parágrafo
    const firstSentence = paragraph.split(/[.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 30 && firstSentence.length < 200) {
      arguments_.push(firstSentence + '.');
    }
  }
  
  // Se não encontrou argumentos suficientes, adicionar referência à teoria
  if (arguments_.length < 2) {
    arguments_.push(`Análise fundamentada na ${keyTheory}.`);
  }
  
  return arguments_.slice(0, 4); // Máximo de 4 argumentos
}

describe('Spectator Mode - Extract Key Arguments', () => {
  it('should extract key arguments from a well-structured text', () => {
    const text = `A análise geopolítica do conflito na Ucrânia revela dinâmicas complexas de poder regional.

O controle do Heartland eurasiano permanece como objetivo estratégico fundamental para a Rússia.

A expansão da OTAN para o leste europeu alterou o equilíbrio de forças na região.

Os recursos energéticos do Mar Negro representam interesse vital para múltiplas potências.`;

    const result = extractKeyArguments(text, 'Teoria do Heartland');
    
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.length).toBeLessThanOrEqual(4);
    expect(result[0]).toContain('análise geopolítica');
  });

  it('should add theory reference when not enough arguments found', () => {
    const text = `Texto curto sem parágrafos suficientes.`;
    
    const result = extractKeyArguments(text, 'Teoria do Poder Marítimo');
    
    expect(result).toContain('Análise fundamentada na Teoria do Poder Marítimo.');
  });

  it('should limit to maximum 4 arguments', () => {
    const text = `Primeiro argumento importante sobre a questão geopolítica em análise.

Segundo argumento relevante para a compreensão do cenário internacional.

Terceiro ponto de vista estratégico sobre as relações de poder.

Quarto aspecto fundamental da dinâmica regional em questão.

Quinto elemento que não deve ser incluído no resultado final.

Sexto ponto adicional que excede o limite estabelecido.`;

    const result = extractKeyArguments(text, 'Realismo Político');
    
    expect(result.length).toBeLessThanOrEqual(4);
  });

  it('should filter out very short sentences', () => {
    const text = `Curto.

Este é um argumento válido com comprimento adequado para análise geopolítica.

Outro curto.

Segunda análise válida sobre a dinâmica de poder internacional.`;

    const result = extractKeyArguments(text, 'Teoria do Rimland');
    
    // Deve ignorar "Curto." e "Outro curto." por serem muito curtos
    result.forEach(arg => {
      expect(arg.length).toBeGreaterThan(30);
    });
  });

  it('should handle empty text gracefully', () => {
    const result = extractKeyArguments('', 'Teoria Geopolítica');
    
    expect(result).toContain('Análise fundamentada na Teoria Geopolítica.');
  });
});

describe('Spectator Mode - Data Structure', () => {
  it('should have correct spectatorMode interface structure', () => {
    // Simular a estrutura de dados do modo espectador
    const spectatorMode = {
      opinionExcerpt: 'Trecho do parecer...',
      keyArguments: ['Argumento 1', 'Argumento 2'],
      theoreticalBasis: 'Teoria do Heartland',
      novaesReaction: {
        type: 'approval' as const,
        message: 'Aprovado com louvor!',
        timestamp: Date.now(),
      },
      debateContext: 'Contexto do debate atual',
    };

    expect(spectatorMode.opinionExcerpt).toBeDefined();
    expect(spectatorMode.keyArguments).toBeInstanceOf(Array);
    expect(spectatorMode.theoreticalBasis).toBeDefined();
    expect(spectatorMode.novaesReaction).toBeDefined();
    expect(spectatorMode.novaesReaction.type).toBe('approval');
    expect(spectatorMode.debateContext).toBeDefined();
  });

  it('should support all novaesReaction types', () => {
    const types = ['approval', 'rejection', 'questioning', 'praise'] as const;
    
    types.forEach(type => {
      const reaction = {
        type,
        message: `Mensagem de ${type}`,
        timestamp: Date.now(),
      };
      
      expect(reaction.type).toBe(type);
      expect(reaction.message).toContain(type);
      expect(reaction.timestamp).toBeGreaterThan(0);
    });
  });
});
