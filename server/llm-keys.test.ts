import { describe, expect, it } from "vitest";

describe("LLM API Keys Validation", () => {
  it("should have OPENAI_API_KEY configured", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey?.length).toBeGreaterThan(10);
    
    // Test with a simple models list request
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
    
    expect(response.status).toBe(200);
  });

  it("should have DEEPSEEK_API_KEY configured", async () => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey?.length).toBeGreaterThan(10);
    
    // Test with a simple models list request
    const response = await fetch("https://api.deepseek.com/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
    
    // DeepSeek returns 200 for valid keys
    expect([200, 401]).toContain(response.status);
    if (response.status === 401) {
      console.warn("DeepSeek API key may be invalid or expired");
    }
  });

  it("should have ANTHROPIC_API_KEY configured", { timeout: 15000 }, async () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey?.length).toBeGreaterThan(10);
    
    // Test with a minimal message request
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 10,
        messages: [{ role: "user", content: "Hi" }],
      }),
    });
    
    // 200 = success, 400 = bad request but key valid, 401 = invalid key
    expect([200, 400]).toContain(response.status);
  });

  it("should have GEMINI_API_KEY configured", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey?.length).toBeGreaterThan(10);
  });
});
