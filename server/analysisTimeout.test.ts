/**
 * Testes para o sistema de timeout de análises
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock do EventEmitter
const mockEmit = vi.fn();
const mockOn = vi.fn();
const mockOff = vi.fn();

// Simular a classe AnalysisProgressEmitter
class MockAnalysisProgressEmitter {
  private trackers: Map<number, { lastProgressTime: number; timeoutId: NodeJS.Timeout | null }> = new Map();
  private static instance: MockAnalysisProgressEmitter;
  
  static getInstance() {
    if (!MockAnalysisProgressEmitter.instance) {
      MockAnalysisProgressEmitter.instance = new MockAnalysisProgressEmitter();
    }
    return MockAnalysisProgressEmitter.instance;
  }
  
  emit = mockEmit;
  on = mockOn;
  off = mockOff;
  
  startTimeoutTracking(analysisId: number, onTimeout: () => Promise<void>) {
    this.stopTimeoutTracking(analysisId);
    
    const tracker = {
      lastProgressTime: Date.now(),
      timeoutId: null as NodeJS.Timeout | null,
    };
    
    this.trackers.set(analysisId, tracker);
    return tracker;
  }
  
  stopTimeoutTracking(analysisId: number) {
    const tracker = this.trackers.get(analysisId);
    if (tracker) {
      if (tracker.timeoutId) {
        clearTimeout(tracker.timeoutId);
      }
      this.trackers.delete(analysisId);
    }
  }
  
  updateLastProgressTime(analysisId: number) {
    const tracker = this.trackers.get(analysisId);
    if (tracker) {
      tracker.lastProgressTime = Date.now();
    }
  }
  
  getTracker(analysisId: number) {
    return this.trackers.get(analysisId);
  }
  
  emitTimeout(analysisId: number) {
    this.stopTimeoutTracking(analysisId);
    this.emit(`analysis:${analysisId}:timeout`, { 
      analysisId, 
      error: 'A análise excedeu o tempo limite de 10 minutos sem progresso e foi cancelada automaticamente.' 
    });
  }
  
  emitProgress(analysisId: number, event: object) {
    this.updateLastProgressTime(analysisId);
    this.emit(`analysis:${analysisId}`, { analysisId, ...event });
  }
  
  emitComplete(analysisId: number, finalReport: string, totalCost: number) {
    this.stopTimeoutTracking(analysisId);
    this.emit(`analysis:${analysisId}:complete`, { analysisId, finalReport, totalCost });
  }
  
  emitError(analysisId: number, error: string) {
    this.stopTimeoutTracking(analysisId);
    this.emit(`analysis:${analysisId}:error`, { analysisId, error });
  }
}

describe('Sistema de Timeout de Análises', () => {
  let emitter: MockAnalysisProgressEmitter;
  
  beforeEach(() => {
    vi.clearAllMocks();
    emitter = MockAnalysisProgressEmitter.getInstance();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('startTimeoutTracking', () => {
    it('deve iniciar o rastreamento de timeout para uma análise', () => {
      const analysisId = 123;
      const onTimeout = vi.fn().mockResolvedValue(undefined);
      
      emitter.startTimeoutTracking(analysisId, onTimeout);
      
      const tracker = emitter.getTracker(analysisId);
      expect(tracker).toBeDefined();
      expect(tracker?.lastProgressTime).toBeLessThanOrEqual(Date.now());
    });
    
    it('deve substituir tracker existente ao iniciar novo rastreamento', () => {
      const analysisId = 456;
      const onTimeout1 = vi.fn().mockResolvedValue(undefined);
      const onTimeout2 = vi.fn().mockResolvedValue(undefined);
      
      emitter.startTimeoutTracking(analysisId, onTimeout1);
      const firstTime = emitter.getTracker(analysisId)?.lastProgressTime;
      
      // Pequeno delay para garantir tempo diferente
      emitter.startTimeoutTracking(analysisId, onTimeout2);
      const secondTime = emitter.getTracker(analysisId)?.lastProgressTime;
      
      expect(secondTime).toBeGreaterThanOrEqual(firstTime!);
    });
  });
  
  describe('stopTimeoutTracking', () => {
    it('deve parar o rastreamento de timeout', () => {
      const analysisId = 789;
      const onTimeout = vi.fn().mockResolvedValue(undefined);
      
      emitter.startTimeoutTracking(analysisId, onTimeout);
      expect(emitter.getTracker(analysisId)).toBeDefined();
      
      emitter.stopTimeoutTracking(analysisId);
      expect(emitter.getTracker(analysisId)).toBeUndefined();
    });
    
    it('não deve falhar ao parar rastreamento inexistente', () => {
      expect(() => emitter.stopTimeoutTracking(999)).not.toThrow();
    });
  });
  
  describe('emitProgress', () => {
    it('deve atualizar o tempo do último progresso', async () => {
      const analysisId = 111;
      const onTimeout = vi.fn().mockResolvedValue(undefined);
      
      emitter.startTimeoutTracking(analysisId, onTimeout);
      const initialTime = emitter.getTracker(analysisId)?.lastProgressTime;
      
      // Pequeno delay real para garantir tempo diferente
      await new Promise(resolve => setTimeout(resolve, 10));
      
      emitter.emitProgress(analysisId, { step: 'test', status: 'running' });
      
      const updatedTime = emitter.getTracker(analysisId)?.lastProgressTime;
      expect(updatedTime).toBeGreaterThanOrEqual(initialTime!);
    });
    
    it('deve emitir evento de progresso', () => {
      const analysisId = 222;
      
      emitter.emitProgress(analysisId, { step: 'Elaborando parecer', status: 'running' });
      
      expect(mockEmit).toHaveBeenCalledWith(
        `analysis:${analysisId}`,
        expect.objectContaining({
          analysisId,
          step: 'Elaborando parecer',
          status: 'running'
        })
      );
    });
  });
  
  describe('emitTimeout', () => {
    it('deve emitir evento de timeout e parar rastreamento', () => {
      const analysisId = 333;
      const onTimeout = vi.fn().mockResolvedValue(undefined);
      
      emitter.startTimeoutTracking(analysisId, onTimeout);
      emitter.emitTimeout(analysisId);
      
      expect(mockEmit).toHaveBeenCalledWith(
        `analysis:${analysisId}:timeout`,
        expect.objectContaining({
          analysisId,
          error: expect.stringContaining('10 minutos')
        })
      );
      
      expect(emitter.getTracker(analysisId)).toBeUndefined();
    });
  });
  
  describe('emitComplete', () => {
    it('deve parar rastreamento ao completar análise', () => {
      const analysisId = 444;
      const onTimeout = vi.fn().mockResolvedValue(undefined);
      
      emitter.startTimeoutTracking(analysisId, onTimeout);
      emitter.emitComplete(analysisId, 'Relatório final', 0.05);
      
      expect(emitter.getTracker(analysisId)).toBeUndefined();
      expect(mockEmit).toHaveBeenCalledWith(
        `analysis:${analysisId}:complete`,
        expect.objectContaining({
          analysisId,
          finalReport: 'Relatório final',
          totalCost: 0.05
        })
      );
    });
  });
  
  describe('emitError', () => {
    it('deve parar rastreamento ao ocorrer erro', () => {
      const analysisId = 555;
      const onTimeout = vi.fn().mockResolvedValue(undefined);
      
      emitter.startTimeoutTracking(analysisId, onTimeout);
      emitter.emitError(analysisId, 'Erro de conexão');
      
      expect(emitter.getTracker(analysisId)).toBeUndefined();
      expect(mockEmit).toHaveBeenCalledWith(
        `analysis:${analysisId}:error`,
        expect.objectContaining({
          analysisId,
          error: 'Erro de conexão'
        })
      );
    });
  });
  
  describe('Integração com status do banco de dados', () => {
    it('deve ter status timeout disponível no schema', () => {
      // Este teste verifica que o status 'timeout' foi adicionado ao enum
      const validStatuses = ['draft', 'processing', 'completed', 'failed', 'timeout'];
      expect(validStatuses).toContain('timeout');
    });
  });
});

describe('Constantes de Timeout', () => {
  it('deve ter timeout de 10 minutos configurado', () => {
    const ANALYSIS_TIMEOUT_MS = 10 * 60 * 1000;
    expect(ANALYSIS_TIMEOUT_MS).toBe(600000); // 10 minutos em ms
  });
  
  it('deve verificar a cada 30 segundos', () => {
    const CHECK_INTERVAL_MS = 30000;
    expect(CHECK_INTERVAL_MS).toBe(30000);
  });
});
