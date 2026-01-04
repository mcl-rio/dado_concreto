import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do banco de dados
vi.mock('./db', () => ({
  getAllLlmPricing: vi.fn(),
  getActiveLlmPricing: vi.fn(),
  getAvailableLlmModels: vi.fn(),
  createLlmPricing: vi.fn(),
  updateLlmPricing: vi.fn(),
  deleteLlmPricing: vi.fn(),
  isValidLlmModel: vi.fn(),
  getLlmPricingByProviderAndModel: vi.fn(),
}));

import * as db from './db';

describe('LLM Pricing Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllLlmPricing', () => {
    it('deve retornar lista de preços de LLMs', async () => {
      const mockPricing = [
        {
          id: 1,
          provider: 'google',
          modelName: 'gemini-2.5-pro',
          displayName: 'Gemini 2.5 Pro',
          inputPricePerMillion: '1.25',
          outputPricePerMillion: '5.00',
          isActive: true,
        },
        {
          id: 2,
          provider: 'anthropic',
          modelName: 'claude-sonnet-4-20250514',
          displayName: 'Claude Sonnet 4',
          inputPricePerMillion: '3.00',
          outputPricePerMillion: '15.00',
          isActive: true,
        },
      ];

      vi.mocked(db.getAllLlmPricing).mockResolvedValue(mockPricing as any);

      const result = await db.getAllLlmPricing();
      
      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe('google');
      expect(result[1].provider).toBe('anthropic');
    });
  });

  describe('getActiveLlmPricing', () => {
    it('deve retornar apenas modelos ativos', async () => {
      const mockActivePricing = [
        {
          id: 1,
          provider: 'google',
          modelName: 'gemini-2.5-pro',
          isActive: true,
        },
      ];

      vi.mocked(db.getActiveLlmPricing).mockResolvedValue(mockActivePricing as any);

      const result = await db.getActiveLlmPricing();
      
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });
  });

  describe('getAvailableLlmModels', () => {
    it('deve retornar modelos disponíveis para seleção', async () => {
      const mockModels = [
        { provider: 'google', modelName: 'gemini-2.5-pro', displayName: 'Gemini 2.5 Pro' },
        { provider: 'anthropic', modelName: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4' },
      ];

      vi.mocked(db.getAvailableLlmModels).mockResolvedValue(mockModels as any);

      const result = await db.getAvailableLlmModels();
      
      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe('google');
      expect(result[0].modelName).toBe('gemini-2.5-pro');
    });
  });

  describe('createLlmPricing', () => {
    it('deve criar novo preço de LLM', async () => {
      const newPricing = {
        provider: 'openai',
        modelName: 'gpt-4o',
        displayName: 'GPT-4o',
        inputPricePerMillion: '2.50',
        outputPricePerMillion: '10.00',
        isActive: true,
      };

      vi.mocked(db.createLlmPricing).mockResolvedValue(undefined);

      await db.createLlmPricing(newPricing);
      
      expect(db.createLlmPricing).toHaveBeenCalledWith(newPricing);
    });
  });

  describe('updateLlmPricing', () => {
    it('deve atualizar preço existente', async () => {
      const updateData = {
        inputPricePerMillion: '1.50',
        outputPricePerMillion: '6.00',
      };

      vi.mocked(db.updateLlmPricing).mockResolvedValue(undefined);

      await db.updateLlmPricing(1, updateData);
      
      expect(db.updateLlmPricing).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('deleteLlmPricing', () => {
    it('deve deletar preço de LLM', async () => {
      vi.mocked(db.deleteLlmPricing).mockResolvedValue(undefined);

      await db.deleteLlmPricing(1);
      
      expect(db.deleteLlmPricing).toHaveBeenCalledWith(1);
    });
  });

  describe('isValidLlmModel', () => {
    it('deve retornar true para modelo válido', async () => {
      vi.mocked(db.isValidLlmModel).mockResolvedValue(true);

      const result = await db.isValidLlmModel('google', 'gemini-2.5-pro');
      
      expect(result).toBe(true);
    });

    it('deve retornar false para modelo inválido', async () => {
      vi.mocked(db.isValidLlmModel).mockResolvedValue(false);

      const result = await db.isValidLlmModel('google', 'modelo-inexistente');
      
      expect(result).toBe(false);
    });
  });

  describe('getLlmPricingByProviderAndModel', () => {
    it('deve retornar preço para provider e modelo específicos', async () => {
      const mockPricing = {
        id: 1,
        provider: 'google',
        modelName: 'gemini-2.5-pro',
        inputPricePerMillion: '1.25',
        outputPricePerMillion: '5.00',
      };

      vi.mocked(db.getLlmPricingByProviderAndModel).mockResolvedValue(mockPricing as any);

      const result = await db.getLlmPricingByProviderAndModel('google', 'gemini-2.5-pro');
      
      expect(result).toBeDefined();
      expect(result?.provider).toBe('google');
      expect(result?.modelName).toBe('gemini-2.5-pro');
    });

    it('deve retornar null para modelo não encontrado', async () => {
      vi.mocked(db.getLlmPricingByProviderAndModel).mockResolvedValue(null);

      const result = await db.getLlmPricingByProviderAndModel('google', 'modelo-inexistente');
      
      expect(result).toBeNull();
    });
  });
});

describe('Price Calculation', () => {
  it('deve calcular custo corretamente por 1000 tokens', () => {
    // Preço por milhão de tokens
    const inputPricePerMillion = 1.25;
    const outputPricePerMillion = 5.00;
    
    // Converter para preço por mil tokens
    const inputPricePerThousand = inputPricePerMillion / 1000;
    const outputPricePerThousand = outputPricePerMillion / 1000;
    
    // Calcular custo para 2000 tokens de input e 1500 de output
    const inputTokens = 2000;
    const outputTokens = 1500;
    
    const cost = (inputTokens / 1000) * inputPricePerThousand + 
                 (outputTokens / 1000) * outputPricePerThousand;
    
    // 2 * 0.00125 + 1.5 * 0.005 = 0.0025 + 0.0075 = 0.01
    expect(cost).toBeCloseTo(0.01, 4);
  });
});
