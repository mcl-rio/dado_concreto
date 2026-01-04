import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getAnalysisBySessionCode: vi.fn(),
}));

import * as db from './db';

describe('Verificação Pública', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar análise válida quando sessionCode existe', async () => {
    const mockAnalysis = {
      id: 1,
      title: 'Análise de Teste',
      sessionCode: 'FGV-GEO-2025-0001',
      status: 'completed',
      createdAt: new Date('2025-01-01'),
    };

    vi.mocked(db.getAnalysisBySessionCode).mockResolvedValue(mockAnalysis);

    const result = await db.getAnalysisBySessionCode('FGV-GEO-2025-0001');

    expect(result).toBeDefined();
    expect(result?.sessionCode).toBe('FGV-GEO-2025-0001');
    expect(result?.title).toBe('Análise de Teste');
    expect(result?.status).toBe('completed');
  });

  it('deve retornar null quando sessionCode não existe', async () => {
    vi.mocked(db.getAnalysisBySessionCode).mockResolvedValue(null);

    const result = await db.getAnalysisBySessionCode('FGV-GEO-INVALID');

    expect(result).toBeNull();
  });

  it('deve validar formato do sessionCode', () => {
    const validCodes = [
      'FGV-GEO-2025-0001',
      'FGV-GEO-2025-0042',
      'FGV-GEO-2024-9999',
    ];

    const invalidCodes = [
      'INVALID',
      'FGV-2025-0001',
      '',
      'fgv-geo-2025-0001',
    ];

    const sessionCodeRegex = /^FGV-GEO-\d{4}-\d{4}$/;

    validCodes.forEach(code => {
      expect(sessionCodeRegex.test(code)).toBe(true);
    });

    invalidCodes.forEach(code => {
      expect(sessionCodeRegex.test(code)).toBe(false);
    });
  });
});

describe('QR Code Generation', () => {
  it('deve gerar URL de verificação correta', () => {
    const baseUrl = 'https://example.com';
    const sessionCode = 'FGV-GEO-2025-0001';
    const expectedUrl = `${baseUrl}/verify/${sessionCode}`;

    expect(expectedUrl).toBe('https://example.com/verify/FGV-GEO-2025-0001');
  });
});
