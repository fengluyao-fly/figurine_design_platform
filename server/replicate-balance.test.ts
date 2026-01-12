import { describe, expect, it } from "vitest";
import Replicate from "replicate";

describe("Replicate Balance Check", () => {
  it("should check account status and balance", async () => {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    expect(apiToken).toBeDefined();

    const replicate = new Replicate({
      auth: apiToken,
    });

    try {
      // Try to get account info
      const account = await replicate.accounts.current();
      console.log("✅ Replicate Account Status:");
      console.log("   Username:", account.username);
      console.log("   Type:", account.type);
      
      // Try a simple prediction to verify API is working
      console.log("\n🔄 Testing image generation capability...");
      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: "a simple test image",
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "png",
          },
        }
      ) as string[];
      
      console.log("✅ Image generation test successful!");
      console.log("   Generated URL:", output[0]);
      
      expect(output).toBeDefined();
      expect(output.length).toBeGreaterThan(0);
    } catch (error: any) {
      console.error("❌ Replicate API Error:");
      console.error("   Message:", error.message);
      console.error("   Status:", error.response?.status);
      console.error("   Details:", error.response?.data);
      throw error;
    }
  }, 60000); // 60 second timeout for image generation
});
