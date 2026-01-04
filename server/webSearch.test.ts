import { describe, it, expect } from "vitest";
import { searchWeb, fetchWebContent } from "./services/webSearch";

describe("Web Search Service", () => {
  it("should return search results for a query", async () => {
    const results = await searchWeb({
      query: "geopolítica brasil",
      numResults: 5,
      language: "pt",
    });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    // Should return at least mock results if APIs fail
    expect(results.length).toBeGreaterThan(0);
    
    // Check result structure
    const firstResult = results[0];
    expect(firstResult).toHaveProperty("id");
    expect(firstResult).toHaveProperty("title");
    expect(firstResult).toHaveProperty("url");
    expect(firstResult).toHaveProperty("snippet");
    expect(firstResult).toHaveProperty("source");
  }, 15000);

  it("should have valid result structure", async () => {
    const results = await searchWeb({
      query: "test query",
      numResults: 3,
    });

    results.forEach((result) => {
      expect(typeof result.id).toBe("string");
      expect(typeof result.title).toBe("string");
      expect(typeof result.url).toBe("string");
      expect(typeof result.snippet).toBe("string");
      expect(typeof result.source).toBe("string");
    });
  });

  it("should handle empty query gracefully", async () => {
    // The function should still work with minimal query
    const results = await searchWeb({
      query: "a",
      numResults: 1,
    });

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  it("should fetch web content from a URL", async () => {
    // Test with a known stable URL
    const content = await fetchWebContent("https://example.com");
    
    expect(content).toBeDefined();
    expect(typeof content).toBe("string");
    // example.com should have some content
    expect(content.length).toBeGreaterThan(0);
  });

  it("should handle invalid URLs gracefully", async () => {
    const content = await fetchWebContent("https://this-domain-does-not-exist-12345.com");
    
    // Should return empty string on error, not throw
    expect(content).toBeDefined();
    expect(typeof content).toBe("string");
  });
});
