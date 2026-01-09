import { describe, expect, it } from "vitest";
import axios from "axios";

describe("Tripo API", () => {
  it("validates API key by fetching task list", async () => {
    const apiKey = process.env.TRIPO_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");

    // Test API key by making a simple request
    const response = await axios.post(
      "https://api.tripo3d.ai/v2/openapi/task",
      {
        type: "text_to_model",
        prompt: "test validation"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        }
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.code).toBe(0);
    expect(response.data.data.task_id).toBeDefined();
  }, 30000); // 30 second timeout
});
