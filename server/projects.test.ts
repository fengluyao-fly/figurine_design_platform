import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(options?: { user?: any; cookies?: Record<string, string> }): TrpcContext {
  return {
    user: options?.user || null,
    req: {
      protocol: "https",
      headers: {},
      cookies: options?.cookies || {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Projects API", () => {
  it("creates a new project with text input", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      inputType: "text",
      textPrompt: "A cute anime-style figurine with blue hair and magical staff",
    });

    expect(result).toHaveProperty("projectId");
    expect(typeof result.projectId).toBe("number");
    expect(result.projectId).toBeGreaterThan(0);
  });

  it("retrieves project by ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    const createResult = await caller.projects.create({
      inputType: "text",
      textPrompt: "Test figurine for retrieval with detailed description",
    });

    // Retrieve the project
    const project = await caller.projects.getById({
      id: createResult.projectId,
    });

    expect(project).toBeDefined();
    expect(project?.id).toBe(createResult.projectId);
    expect(project?.textPrompt).toBe("Test figurine for retrieval with detailed description");
    expect(project?.status).toBe("draft");
    expect(project?.inputType).toBe("text");
  });

  it("retrieves projects by session", async () => {
    const sessionId = "test-session-" + Date.now();
    
    // Create context with session cookie
    const ctx = createTestContext({ cookies: { 'figurine_session': sessionId } });
    const caller = appRouter.createCaller(ctx);

    // Create a project
    await caller.projects.create({
      inputType: "text",
      textPrompt: "First project with detailed description for testing",
    });

    // Retrieve all projects for this session
    const projects = await caller.projects.getBySession();

    expect(projects).toBeDefined();
    expect(Array.isArray(projects)).toBe(true);
  });

  it("requires login to save project to account", async () => {
    const ctx = createTestContext(); // No user logged in
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    const createResult = await caller.projects.create({
      inputType: "text",
      textPrompt: "Test project for save",
    });

    // Try to save without being logged in
    await expect(
      caller.projects.saveToAccount({ projectId: createResult.projectId })
    ).rejects.toThrow("LOGIN_REQUIRED");
  });

  it("allows saving project when logged in", async () => {
    const mockUser = { id: 1, name: "Test User", openId: "test-open-id" };
    const ctx = createTestContext({ user: mockUser });
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    const createResult = await caller.projects.create({
      inputType: "text",
      textPrompt: "Test project for save",
    });

    // Save the project
    const result = await caller.projects.saveToAccount({ projectId: createResult.projectId });
    expect(result.success).toBe(true);
  });

  it("returns empty array for getSavedProjects when not logged in", async () => {
    const ctx = createTestContext(); // No user logged in
    const caller = appRouter.createCaller(ctx);

    const projects = await caller.projects.getSavedProjects();
    expect(projects).toEqual([]);
  });
});
