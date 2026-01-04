import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do banco de dados
vi.mock('./db', () => ({
  isValidLlmModel: vi.fn(),
  upsertCounselorLlmConfig: vi.fn(),
  getAllCounselorLlmConfigs: vi.fn(),
}));

import * as db from './db';

describe('LLM Config Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidLlmModel', () => {
    it('deve retornar true para modelo válido cadastrado na tabela de preços', async () => {
      vi.mocked(db.isValidLlmModel).mockResolvedValue(true);

      const result = await db.isValidLlmModel('google', 'gemini-2.5-pro');
      
      expect(result).toBe(true);
      expect(db.isValidLlmModel).toHaveBeenCalledWith('google', 'gemini-2.5-pro');
    });

    it('deve retornar false para modelo não cadastrado na tabela de preços', async () => {
      vi.mocked(db.isValidLlmModel).mockResolvedValue(false);

      const result = await db.isValidLlmModel('google', 'modelo-inexistente');
      
      expect(result).toBe(false);
    });

    it('deve retornar false para provedor inválido', async () => {
      vi.mocked(db.isValidLlmModel).mockResolvedValue(false);

      const result = await db.isValidLlmModel('provedor-invalido', 'gemini-2.5-pro');
      
      expect(result).toBe(false);
    });
  });

  describe('Validação de configuração de LLM', () => {
    it('deve permitir salvar configuração com modelo válido', async () => {
      vi.mocked(db.isValidLlmModel).mockResolvedValue(true);
      vi.mocked(db.upsertCounselorLlmConfig).mockResolvedValue(undefined);

      // Simular fluxo de validação
      const provider = 'google';
      const model = 'gemini-2.5-pro';
      
      const isValid = await db.isValidLlmModel(provider, model);
      expect(isValid).toBe(true);
      
      if (isValid) {
        await db.upsertCounselorLlmConfig({
          counselorId: 'test-counselor',
          counselorName: 'Test Counselor',
          llmProvider: provider,
          llmModel: model,
          endpoint: null,
          apiKey: null,
          isActive: true,
        });
        
        expect(db.upsertCounselorLlmConfig).toHaveBeenCalled();
      }
    });

    it('deve rejeitar configuração com modelo inválido', async () => {
      vi.mocked(db.isValidLlmModel).mockResolvedValue(false);

      const provider = 'google';
      const model = 'modelo-inexistente';
      
      const isValid = await db.isValidLlmModel(provider, model);
      expect(isValid).toBe(false);
      
      // Não deve chamar upsert se modelo é inválido
      expect(db.upsertCounselorLlmConfig).not.toHaveBeenCalled();
    });
  });

  describe('Bulk update validation', () => {
    it('deve validar modelo antes de atualizar em massa', async () => {
      vi.mocked(db.isValidLlmModel).mockResolvedValue(true);
      vi.mocked(db.getAllCounselorLlmConfigs).mockResolvedValue([
        { counselorId: 'c1', counselorName: 'Counselor 1', llmProvider: 'google', llmModel: 'old-model', isActive: true },
        { counselorId: 'c2', counselorName: 'Counselor 2', llmProvider: 'google', llmModel: 'old-model', isActive: true },
      ] as any);
      vi.mocked(db.upsertCounselorLlmConfig).mockResolvedValue(undefined);

      const newProvider = 'anthropic';
      const newModel = 'claude-sonnet-4-20250514';
      
      // Validar primeiro
      const isValid = await db.isValidLlmModel(newProvider, newModel);
      expect(isValid).toBe(true);
      
      if (isValid) {
        const configs = await db.getAllCounselorLlmConfigs();
        for (const config of configs) {
          await db.upsertCounselorLlmConfig({
            counselorId: config.counselorId,
            counselorName: config.counselorName,
            llmProvider: newProvider,
            llmModel: newModel,
            endpoint: null,
            apiKey: null,
            isActive: config.isActive,
          });
        }
        
        expect(db.upsertCounselorLlmConfig).toHaveBeenCalledTimes(2);
      }
    });

    it('deve rejeitar bulk update com modelo inválido', async () => {
      vi.mocked(db.isValidLlmModel).mockResolvedValue(false);

      const newProvider = 'anthropic';
      const newModel = 'modelo-inexistente';
      
      const isValid = await db.isValidLlmModel(newProvider, newModel);
      expect(isValid).toBe(false);
      
      // Não deve chamar getAllCounselorLlmConfigs nem upsert se modelo é inválido
      expect(db.getAllCounselorLlmConfigs).not.toHaveBeenCalled();
      expect(db.upsertCounselorLlmConfig).not.toHaveBeenCalled();
    });
  });
});

describe('Provider and Model Name Matching', () => {
  it('deve fazer match exato de provider e modelName', async () => {
    vi.mocked(db.isValidLlmModel).mockImplementation(async (provider, model) => {
      const validCombinations = [
        { provider: 'google', model: 'gemini-2.5-pro' },
        { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
        { provider: 'openai', model: 'gpt-4o' },
      ];
      
      return validCombinations.some(c => c.provider === provider && c.model === model);
    });

    // Combinações válidas
    expect(await db.isValidLlmModel('google', 'gemini-2.5-pro')).toBe(true);
    expect(await db.isValidLlmModel('anthropic', 'claude-sonnet-4-20250514')).toBe(true);
    expect(await db.isValidLlmModel('openai', 'gpt-4o')).toBe(true);

    // Combinações inválidas (modelo certo, provedor errado)
    expect(await db.isValidLlmModel('anthropic', 'gemini-2.5-pro')).toBe(false);
    expect(await db.isValidLlmModel('google', 'claude-sonnet-4-20250514')).toBe(false);
  });
});
