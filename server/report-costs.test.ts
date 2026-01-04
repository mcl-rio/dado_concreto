import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Report Costs Functions", () => {
  it("should have getReportCosts function", () => {
    expect(typeof db.getReportCosts).toBe("function");
  });

  it("should have getReportCostsSummary function", () => {
    expect(typeof db.getReportCostsSummary).toBe("function");
  });

  it("should return array from getReportCosts", async () => {
    const result = await db.getReportCosts(10);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return summary object from getReportCostsSummary", async () => {
    const result = await db.getReportCostsSummary();
    expect(result).toHaveProperty("totalReports");
    expect(result).toHaveProperty("totalCost");
    expect(result).toHaveProperty("totalInputTokens");
    expect(result).toHaveProperty("totalOutputTokens");
    expect(result).toHaveProperty("avgCostPerReport");
  });

  it("should return report costs with correct structure", async () => {
    const result = await db.getReportCosts(10);
    if (result.length > 0) {
      const report = result[0];
      expect(report).toHaveProperty("analysisId");
      expect(report).toHaveProperty("title");
      expect(report).toHaveProperty("userId");
      expect(report).toHaveProperty("userName");
      expect(report).toHaveProperty("inputTokens");
      expect(report).toHaveProperty("outputTokens");
      expect(report).toHaveProperty("totalTokens");
      expect(report).toHaveProperty("totalCostUsd");
    }
  });
});
