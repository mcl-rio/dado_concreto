import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Counselor LLM Config", () => {
  it("should initialize default configs (coordinators and tasks only)", async () => {
    await db.initializeDefaultCounselorConfigs();
    const configs = await db.getAllCounselorLlmConfigs();
    
    // Should have coordinators and tasks (GennovAIs, Editor, proposal_evaluator, structure_generator, web_searcher)
    // Conselheiros são cadastrados pelo usuário via painel administrativo
    expect(configs.length).toBeGreaterThanOrEqual(5);
    
    // Check that coordinators are present
    const counselorIds = configs.map(c => c.counselorId);
    expect(counselorIds.some(id => id === 'gennovais' || id === 'gennovais')).toBe(true);
    expect(counselorIds).toContain("editor");
  });

  it("should have correct default LLM configuration", async () => {
    const configs = await db.getAllCounselorLlmConfigs();
    
    // All configs should have a valid LLM provider configured
    for (const config of configs) {
      expect(['google', 'gemini', 'anthropic', 'openai', 'deepseek']).toContain(config.llmProvider);
      expect(config.isActive).toBeDefined();
    }
  });

  it("should return undefined for non-existent counselor", async () => {
    const config = await db.getCounselorLlmConfig("non-existent");
    expect(config).toBeUndefined();
  });

  it("should have GennovAIs and Editor configured with valid LLM provider", async () => {
    let novaes = await db.getCounselorLlmConfig("gennovais");
    if (!novaes) {
      novaes = await db.getCounselorLlmConfig("gennovais");
    }
    const editor = await db.getCounselorLlmConfig("editor");
    
    expect(novaes).toBeDefined();
    expect(novaes?.counselorName).toMatch(/GennovAIs|General.*NovaAIs|General.*NovAIs/i);
    expect(['google', 'gemini', 'anthropic']).toContain(novaes?.llmProvider);
    
    expect(editor).toBeDefined();
    expect(editor?.counselorName).toBe("Editor");
    expect(['google', 'gemini', 'anthropic']).toContain(editor?.llmProvider);
  });
});
