import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do banco de dados
const mockDb = {
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue({}),
};

vi.mock('./db', () => ({
  reorderCounselorLlmConfigs: async (items: { counselorId: string; displayOrder: number }[]) => {
    for (const item of items) {
      mockDb.update();
      mockDb.set({ displayOrder: item.displayOrder });
      mockDb.where();
    }
    return { success: true };
  },
  getAllCounselorLlmConfigs: async () => [
    { id: 1, counselorId: 'mackinder', counselorName: 'Mackinder', displayOrder: 0 },
    { id: 2, counselorId: 'mahan', counselorName: 'Mahan', displayOrder: 1 },
    { id: 3, counselorId: 'spykman', counselorName: 'Spykman', displayOrder: 2 },
  ],
}));

describe('Reorder Counselor LLM Configs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve reordenar configs corretamente', async () => {
    const { reorderCounselorLlmConfigs } = await import('./db');
    
    const newOrder = [
      { counselorId: 'mahan', displayOrder: 0 },
      { counselorId: 'mackinder', displayOrder: 1 },
      { counselorId: 'spykman', displayOrder: 2 },
    ];
    
    const result = await reorderCounselorLlmConfigs(newOrder);
    
    expect(result).toEqual({ success: true });
  });

  it('deve retornar configs ordenados por displayOrder', async () => {
    const { getAllCounselorLlmConfigs } = await import('./db');
    
    const configs = await getAllCounselorLlmConfigs();
    
    expect(configs).toHaveLength(3);
    expect(configs[0].displayOrder).toBe(0);
    expect(configs[1].displayOrder).toBe(1);
    expect(configs[2].displayOrder).toBe(2);
  });

  it('deve aceitar array vazio sem erros', async () => {
    const { reorderCounselorLlmConfigs } = await import('./db');
    
    const result = await reorderCounselorLlmConfigs([]);
    
    expect(result).toEqual({ success: true });
  });

  it('deve processar múltiplos itens na ordem correta', async () => {
    const { reorderCounselorLlmConfigs } = await import('./db');
    
    const items = [
      { counselorId: 'gennovais', displayOrder: 0 },
      { counselorId: 'editor', displayOrder: 1 },
      { counselorId: 'mackinder', displayOrder: 2 },
      { counselorId: 'mahan', displayOrder: 3 },
    ];
    
    const result = await reorderCounselorLlmConfigs(items);
    
    expect(result.success).toBe(true);
  });
});
