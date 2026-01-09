import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { nanoid } from "nanoid";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Projects API", () => {
  it("creates a new project with description", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const sessionId = nanoid();
    const description = "A cute anime-style figurine with blue hair and magical staff";

    const result = await caller.projects.create({
      sessionId,
      description,
    });

    expect(result).toHaveProperty("projectId");
    expect(typeof result.projectId).toBe("number");
    expect(result.projectId).toBeGreaterThan(0);
  });

  it("retrieves project by ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    const sessionId = nanoid();
    const description = "Test figurine for retrieval with detailed description";
    const createResult = await caller.projects.create({
      sessionId,
      description,
    });

    // Retrieve the project
    const project = await caller.projects.getById({
      id: createResult.projectId,
    });

    expect(project).toBeDefined();
    expect(project?.id).toBe(createResult.projectId);
    expect(project?.description).toBe(description);
    expect(project?.status).toBe("draft");
  });

  it("retrieves projects by session ID", async () => {
    const sessionId = nanoid();
    
    // Create context with session cookie
    const ctx = createTestContext();
    (ctx.req as any).cookies = { 'figurine_session': sessionId };
    const caller = appRouter.createCaller(ctx);

    // Create multiple projects
    await caller.projects.create({
      sessionId,
      description: "First project with detailed description for testing",
    });
    await caller.projects.create({
      sessionId,
      description: "Second project with detailed description for testing",
    });

    // Retrieve all projects for this session
    const projects = await caller.projects.getBySession();

    expect(projects).toBeDefined();
    expect(projects.length).toBeGreaterThanOrEqual(2);
    expect(projects.every((p) => p.sessionId === sessionId)).toBe(true);
  });
});
