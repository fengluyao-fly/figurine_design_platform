import { describe, expect, it } from "vitest";
import Replicate from "replicate";

describe("Replicate API", () => {
  it("should authenticate successfully with provided API key", async () => {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    expect(apiToken).toBeDefined();
    expect(apiToken).toMatch(/^r8_/);

    const replicate = new Replicate({
      auth: apiToken,
    });

    // Test API connection by listing models (lightweight operation)
    const models = await replicate.models.list();
    expect(models).toBeDefined();
    expect(Array.isArray(models.results)).toBe(true);
  }, 30000);
});
