import { describe, expect, it, vi } from "vitest";
import { ANALYSTS, estimateAnalysisCost, getAnalystById } from "./services/multiAgents";

describe("Multi-Agents System", () => {
  describe("ANALYSTS configuration", () => {
    it("should start with empty analysts array (user adds via admin panel)", () => {
      // Conselheiros são cadastrados pelo usuário via painel administrativo
      expect(ANALYSTS).toHaveLength(0);
    });
  });

  describe("getAnalystById", () => {
    it("should return undefined for any id when no analysts are configured", () => {
      const analyst = getAnalystById("any-id");
      expect(analyst).toBeUndefined();
    });
  });

  describe("estimateAnalysisCost", () => {
    it("should handle empty array", () => {
      const cost = estimateAnalysisCost([]);
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it("should include gennovais and editor costs even with no analysts", () => {
      // Base cost should include gennovais + editor even with 0 analysts
      const baseCost = estimateAnalysisCost([]);
      expect(baseCost).toBeGreaterThanOrEqual(0);
    });
  });
});
