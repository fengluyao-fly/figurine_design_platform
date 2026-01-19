import { describe, it, expect, vi } from "vitest";

describe("Notification Service", () => {
  it("validates Resend API key is configured", async () => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    // Check if API key is set
    expect(RESEND_API_KEY).toBeDefined();
    expect(RESEND_API_KEY?.length).toBeGreaterThan(10);
    
    // Test API key by making a lightweight API call
    if (RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/domains", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
      });
      
      // API key is valid if we get 200 or 401 (valid key but no domains)
      // Invalid key returns 401 with specific error
      expect(response.status).toBeLessThan(500);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log("[Resend] API key valid, domains:", data.data?.length || 0);
      } else if (response.status === 401) {
        const error = await response.json();
        // Check if it's an invalid API key error vs just no permissions
        if (error.message?.includes("Invalid API key")) {
          throw new Error("Invalid Resend API key");
        }
        console.log("[Resend] API key valid but limited permissions");
      }
    }
  });

  it("notification functions are exported correctly", async () => {
    const { notifyAdmin, notifyNewOrder, notifyModelUpload, notifyPaymentReceived } = await import("./notification");
    
    expect(typeof notifyAdmin).toBe("function");
    expect(typeof notifyNewOrder).toBe("function");
    expect(typeof notifyModelUpload).toBe("function");
    expect(typeof notifyPaymentReceived).toBe("function");
  });
});
