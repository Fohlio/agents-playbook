/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from "@/lib/db/__mocks__/client";

jest.mock("@/lib/db/client", () => ({
  prisma: prismaMock,
}));

jest.mock("@/lib/auth/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, init?: any) => {
      const response = {
        status: init?.status || 200,
        json: async () => data,
      };
      return response;
    },
  },
}));

import { auth } from "@/lib/auth/auth";
import { POST } from "../route";

describe("POST /api/v1/share/create", () => {
  const mockSession = {
    user: {
      id: "user-123",
      email: "test@example.com",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates share link for owned workflow", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const mockWorkflow = {
      id: "workflow-1",
      userId: "user-123",
      name: "Test Workflow",
    };

    prismaMock.workflow.findFirst.mockResolvedValue(mockWorkflow as any);
    prismaMock.sharedLink.findFirst.mockResolvedValue(null);
    prismaMock.sharedLink.create.mockImplementation((args) => {
      return Promise.resolve({
        id: "share-1",
        userId: "user-123",
        targetType: "WORKFLOW",
        targetId: "workflow-1",
        shareToken: args.data.shareToken,
        isActive: true,
        expiresAt: null,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    });

    const request = new Request("http://localhost/api/v1/share/create", {
      method: "POST",
      body: JSON.stringify({
        targetType: "WORKFLOW",
        targetId: "workflow-1",
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.shareToken).toMatch(/^[0-9a-f]{32}$/);
    expect(prismaMock.workflow.findFirst).toHaveBeenCalledWith({
      where: { id: "workflow-1", userId: "user-123" },
    });
  });

  it("creates share link for mini-prompt with expiration", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const mockMiniPrompt = {
      id: "mini-prompt-1",
      userId: "user-123",
      name: "Test Mini Prompt",
    };

    prismaMock.miniPrompt.findFirst.mockResolvedValue(mockMiniPrompt as any);
    prismaMock.sharedLink.findFirst.mockResolvedValue(null);
    prismaMock.sharedLink.create.mockImplementation((args) => {
      return Promise.resolve({
        id: "share-1",
        userId: "user-123",
        targetType: "MINI_PROMPT",
        targetId: "mini-prompt-1",
        shareToken: args.data.shareToken,
        isActive: true,
        expiresAt: args.data.expiresAt,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    });

    const request = new Request("http://localhost/api/v1/share/create", {
      method: "POST",
      body: JSON.stringify({
        targetType: "MINI_PROMPT",
        targetId: "mini-prompt-1",
        expiresAt: expiresAt.toISOString(),
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(prismaMock.sharedLink.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          targetType: "MINI_PROMPT",
          expiresAt: expect.any(Date),
        }),
      })
    );
  });

  it("returns existing share link if already exists", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const mockWorkflow = {
      id: "workflow-1",
      userId: "user-123",
    };

    const existingShareLink = {
      id: "share-1",
      userId: "user-123",
      targetType: "WORKFLOW",
      targetId: "workflow-1",
      shareToken: "existing-token-abc123def456",
      isActive: true,
      expiresAt: null,
      viewCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.workflow.findFirst.mockResolvedValue(mockWorkflow as any);
    prismaMock.sharedLink.findFirst.mockResolvedValue(existingShareLink as any);

    const request = new Request("http://localhost/api/v1/share/create", {
      method: "POST",
      body: JSON.stringify({
        targetType: "WORKFLOW",
        targetId: "workflow-1",
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.shareToken).toBe("existing-token-abc123def456");
    expect(json.message).toBe("Share link already exists");
    expect(prismaMock.sharedLink.create).not.toHaveBeenCalled();
  });

  it("returns 401 when not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new Request("http://localhost/api/v1/share/create", {
      method: "POST",
      body: JSON.stringify({
        targetType: "WORKFLOW",
        targetId: "workflow-1",
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
    expect(prismaMock.workflow.findFirst).not.toHaveBeenCalled();
  });

  it("returns 400 when targetType is invalid", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const request = new Request("http://localhost/api/v1/share/create", {
      method: "POST",
      body: JSON.stringify({
        targetType: "INVALID_TYPE",
        targetId: "workflow-1",
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBeDefined();
    expect(prismaMock.workflow.findFirst).not.toHaveBeenCalled();
  });

  it("returns 400 when targetId is missing", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const request = new Request("http://localhost/api/v1/share/create", {
      method: "POST",
      body: JSON.stringify({
        targetType: "WORKFLOW",
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it("returns 400 when user does not own the target", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    prismaMock.workflow.findFirst.mockResolvedValue(null);

    const request = new Request("http://localhost/api/v1/share/create", {
      method: "POST",
      body: JSON.stringify({
        targetType: "WORKFLOW",
        targetId: "workflow-1",
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("You do not own this item");
    expect(prismaMock.sharedLink.create).not.toHaveBeenCalled();
  });

  it("returns 400 when creation fails", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    prismaMock.workflow.findFirst.mockResolvedValue({ id: "workflow-1", userId: "user-123" } as any);
    prismaMock.sharedLink.findFirst.mockResolvedValue(null);
    prismaMock.sharedLink.create.mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost/api/v1/share/create", {
      method: "POST",
      body: JSON.stringify({
        targetType: "WORKFLOW",
        targetId: "workflow-1",
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Failed to create share link");
  });
});
