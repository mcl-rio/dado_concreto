import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("LLM Usage Costs", () => {
  it("should return empty summary when no usage recorded", async () => {
    const summary = await db.getLlmUsageSummary();
    
    expect(summary).toBeDefined();
    expect(typeof summary.totalCost).toBe("number");
    expect(typeof summary.totalTokens).toBe("number");
    expect(typeof summary.totalRequests).toBe("number");
    expect(Array.isArray(summary.byProvider)).toBe(true);
  });

  it("should return empty array for costs by provider when no usage", async () => {
    const costs = await db.getLlmUsageCostsByProvider();
    
    expect(Array.isArray(costs)).toBe(true);
  });

  it("should return empty array for recent usage when no records", async () => {
    const recent = await db.getRecentLlmUsage(10);
    
    expect(Array.isArray(recent)).toBe(true);
  });

  it("should return empty array for costs by period", async () => {
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-12-31");
    
    const costs = await db.getLlmUsageCostsByPeriod(startDate, endDate);
    
    expect(Array.isArray(costs)).toBe(true);
  });

  it("should record LLM usage successfully", async () => {
    // Record a test usage
    await db.recordLlmUsage({
      userId: 1,
      counselorId: "test_counselor",
      llmProvider: "gemini",
      llmModel: "gemini-2.0-flash-exp",
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      costUsd: "0.000150",
      requestType: "test",
    });

    // Verify it was recorded
    const summary = await db.getLlmUsageSummary();
    expect(summary.totalRequests).toBeGreaterThanOrEqual(1);
  });
});
