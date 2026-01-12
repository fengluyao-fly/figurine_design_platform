import { describe, expect, it } from "vitest";
import { generateThreeViews } from "./nano-banana";

describe("Nano Banana Pro Integration", () => {
  it("should generate three views from text prompt", async () => {
    const result = await generateThreeViews({
      prompt: "a simple cube, product design",
      resolution: "1K", // Use 1K for faster testing
    });

    expect(result).toHaveProperty("frontView");
    expect(result).toHaveProperty("sideView");
    expect(result).toHaveProperty("backView");
    
    expect(result.frontView).toMatch(/^https?:\/\//);
    expect(result.sideView).toMatch(/^https?:\/\//);
    expect(result.backView).toMatch(/^https?:\/\//);
    
    console.log("[Test] Three views generated successfully:");
    console.log("  Front:", result.frontView);
    console.log("  Side:", result.sideView);
    console.log("  Back:", result.backView);
  }, 180000); // 3 minutes timeout for API call
});
