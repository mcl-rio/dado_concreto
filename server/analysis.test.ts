import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions
vi.mock("./db", () => ({
  createAnalysis: vi.fn().mockResolvedValue(1),
  getAnalysisById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    title: "Test Analysis",
    objective: "Test objective",
    status: "draft",
    analysisStructure: null,
    reportStructure: null,
    generatedContent: null,
    savedToHistory: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    completedAt: null,
  }),
  getAnalysesByUserId: vi.fn().mockResolvedValue([]),
  updateAnalysis: vi.fn().mockResolvedValue(undefined),
  deleteAnalysis: vi.fn().mockResolvedValue(undefined),
  getSourcesByAnalysisId: vi.fn().mockResolvedValue([]),
  addAnalysisSource: vi.fn().mockResolvedValue(1),
  deleteAnalysisSource: vi.fn().mockResolvedValue(undefined),
  checkUserAccess: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Analysis Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new analysis", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.create({
      title: "Test Analysis",
      objective: "Test objective for geopolitical analysis",
    });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);
  });

  it("should list user analyses", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.list({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get a single analysis", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.get({ id: 1 });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("objective");
    expect(result).toHaveProperty("sources");
  });

  it("should update an analysis", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.update({
      id: 1,
      title: "Updated Title",
    });

    expect(result).toEqual({ success: true });
  });

  it("should delete an analysis", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });

  it("should add a source to analysis", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analysis.addSource({
      analysisId: 1,
      sourceType: "news",
      title: "Test News Article",
      url: "https://example.com/article",
      content: "Article content here",
    });

    expect(result).toHaveProperty("id");
  });
});
