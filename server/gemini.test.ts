import { describe, expect, it } from "vitest";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

describe("Gemini API Integration", () => {
  it("should validate Gemini API key with a simple request", async () => {
    expect(GEMINI_API_KEY).toBeDefined();
    expect(GEMINI_API_KEY).not.toBe("");

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: 'Responda apenas com a palavra "OK"' }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10,
        },
      }),
    });

    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.candidates).toBeDefined();
    expect(data.candidates.length).toBeGreaterThan(0);
  });
});
