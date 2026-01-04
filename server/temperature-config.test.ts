import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Temperature Configuration', () => {
  beforeAll(async () => {
    // Initialize default temperature configs
    await db.initializeDefaultTemperatureConfigs();
  });

  it('should initialize default temperature configs', async () => {
    const configs = await db.getTemperatureConfigs();
    expect(configs).toBeDefined();
    expect(configs.length).toBeGreaterThanOrEqual(4);
    
    const agentTypes = configs.map(c => c.agentType);
    expect(agentTypes).toContain('counselor');
    expect(agentTypes).toContain('gennovais');
    expect(agentTypes).toContain('editor');
    expect(agentTypes).toContain('default');
  });

  it('should get temperature config for specific agent type', async () => {
    const counselorConfig = await db.getTemperatureConfig('counselor');
    expect(counselorConfig).toBeDefined();
    expect(counselorConfig?.agentType).toBe('counselor');
    expect(parseFloat(counselorConfig?.temperature?.toString() || '0')).toBeGreaterThan(0);
  });

  it('should return correct temperature for agent types', async () => {
    const counselorTemp = await db.getTemperatureForAgent('counselor');
    const gennovaisTemp = await db.getTemperatureForAgent('gennovais');
    const editorTemp = await db.getTemperatureForAgent('editor');
    const defaultTemp = await db.getTemperatureForAgent('default');

    // Verify temperatures are within valid range
    expect(counselorTemp).toBeGreaterThanOrEqual(0);
    expect(counselorTemp).toBeLessThanOrEqual(1);
    expect(gennovaisTemp).toBeGreaterThanOrEqual(0);
    expect(gennovaisTemp).toBeLessThanOrEqual(1);
    expect(editorTemp).toBeGreaterThanOrEqual(0);
    expect(editorTemp).toBeLessThanOrEqual(1);
    expect(defaultTemp).toBeGreaterThanOrEqual(0);
    expect(defaultTemp).toBeLessThanOrEqual(1);

    // Verify expected hierarchy: counselor > gennovais > editor
    expect(counselorTemp).toBeGreaterThan(gennovaisTemp);
    expect(gennovaisTemp).toBeGreaterThan(editorTemp);
  });

  it('should return fallback temperature for unknown agent type', async () => {
    const unknownTemp = await db.getTemperatureForAgent('unknown_agent');
    // Deve retornar o valor de fallback (0.7 ou 0.8 dependendo da configuração do banco)
    expect(unknownTemp).toBeGreaterThanOrEqual(0.7);
    expect(unknownTemp).toBeLessThanOrEqual(0.9);
  });

  it('should update temperature config', async () => {
    const originalConfig = await db.getTemperatureConfig('counselor');
    const originalTemp = parseFloat(originalConfig?.temperature?.toString() || '0.85');

    // Update to a new value
    await db.upsertTemperatureConfig({
      agentType: 'counselor',
      temperature: '0.90',
      description: 'Test update',
    });

    const updatedConfig = await db.getTemperatureConfig('counselor');
    expect(parseFloat(updatedConfig?.temperature?.toString() || '0')).toBe(0.90);

    // Restore original value
    await db.upsertTemperatureConfig({
      agentType: 'counselor',
      temperature: originalTemp.toFixed(2),
      description: 'Alta criatividade para análises diversificadas dos conselheiros',
    });
  });
});
