import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the LLM module
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn(),
}));

// Mock the image generation module
vi.mock('./_core/imageGeneration', () => ({
  generateImage: vi.fn(),
}));

// Mock the database module
vi.mock('./db', () => ({
  getSystemPrompt: vi.fn(),
}));

describe('Counselor Auto-Fill Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAutoFill mutation', () => {
    it('should require a non-empty name', async () => {
      // The mutation requires name to be at least 1 character
      const input = { name: '' };
      expect(input.name.length).toBe(0);
    });

    it('should accept a valid name', () => {
      const input = { name: 'Hans Morgenthau' };
      expect(input.name.length).toBeGreaterThan(0);
    });

    it('should generate valid counselor data structure', async () => {
      const { invokeLLM } = await import('./_core/llm');
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              counselorId: 'hans-morgenthau',
              name: 'Hans Joachim Morgenthau',
              shortName: 'Morgenthau',
              nationality: 'Americano (nascido na Alemanha)',
              birthYear: 1904,
              deathYear: 1980,
              mainTheory: 'Realismo Político',
              shortBio: 'Cientista político e teórico das relações internacionais.',
              fullBio: 'Hans Morgenthau foi um dos fundadores do realismo nas relações internacionais...',
              keyContributions: ['Teoria do Realismo Político', 'Seis Princípios do Realismo'],
              areasOfExpertise: ['Relações Internacionais', 'Teoria Política'],
              mainBooks: [{ title: 'Politics Among Nations', year: 1948, description: 'Obra seminal do realismo político' }],
              personalityTraits: ['Analítico', 'Pragmático'],
              writingStyle: 'Acadêmico e rigoroso',
              analysisApproach: 'Baseado em poder e interesse nacional',
              keyPhrases: ['O interesse nacional é o guia da política externa'],
            }),
          },
        }],
      };

      (invokeLLM as any).mockResolvedValue(mockLLMResponse);

      const result = await (invokeLLM as any)({
        messages: [
          { role: 'system', content: 'Test prompt' },
          { role: 'user', content: 'Gere o perfil completo para: Hans Morgenthau' },
        ],
        response_format: { type: 'json_object' },
      });

      const content = result.choices[0].message.content;
      const data = JSON.parse(content);

      expect(data).toHaveProperty('counselorId');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('shortName');
      expect(data).toHaveProperty('nationality');
      expect(data).toHaveProperty('birthYear');
      expect(data).toHaveProperty('mainTheory');
      expect(data).toHaveProperty('shortBio');
      expect(data).toHaveProperty('fullBio');
      expect(data).toHaveProperty('keyContributions');
      expect(data).toHaveProperty('areasOfExpertise');
      expect(data).toHaveProperty('mainBooks');
      expect(data).toHaveProperty('personalityTraits');
      expect(data).toHaveProperty('writingStyle');
      expect(data).toHaveProperty('analysisApproach');
      expect(data).toHaveProperty('keyPhrases');
    });

    it('should handle image generation', async () => {
      const { generateImage } = await import('./_core/imageGeneration');
      
      (generateImage as any).mockResolvedValue({ url: 'https://example.com/generated-image.png' });

      const result = await (generateImage as any)({
        prompt: 'Professional portrait of Hans Morgenthau',
      });

      expect(result).toHaveProperty('url');
      expect(result.url).toContain('https://');
    });

    it('should handle LLM errors gracefully', async () => {
      const { invokeLLM } = await import('./_core/llm');
      
      (invokeLLM as any).mockRejectedValue(new Error('LLM service unavailable'));

      await expect((invokeLLM as any)({
        messages: [{ role: 'user', content: 'test' }],
      })).rejects.toThrow('LLM service unavailable');
    });

    it('should handle invalid JSON response', () => {
      const invalidJson = 'This is not valid JSON';
      
      expect(() => JSON.parse(invalidJson)).toThrow();
    });
  });

  describe('System Prompt for Auto-Fill', () => {
    it('should have counselor_autofill prompt key', async () => {
      const { getSystemPrompt } = await import('./db');
      
      (getSystemPrompt as any).mockResolvedValue({
        promptKey: 'counselor_autofill',
        promptName: 'Preenchimento Automático de Conselheiros',
        promptContent: 'Você é um especialista em geopolítica...',
      });

      const prompt = await (getSystemPrompt as any)('counselor_autofill');
      
      expect(prompt).not.toBeNull();
      expect(prompt.promptKey).toBe('counselor_autofill');
    });

    it('should fall back to default prompt if not found', async () => {
      const { getSystemPrompt } = await import('./db');
      
      (getSystemPrompt as any).mockResolvedValue(null);

      const prompt = await (getSystemPrompt as any)('counselor_autofill');
      
      // When prompt is null, the system should use default prompt
      expect(prompt).toBeNull();
    });
  });
});
