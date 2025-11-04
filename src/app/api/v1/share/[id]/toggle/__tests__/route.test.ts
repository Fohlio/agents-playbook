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
import { PATCH } from "../route";

describe("PATCH /api/v1/share/[id]/toggle", () => {
  const mockSession = {
    user: {
      id: "user-123",
      email: "test@example.com",
    },
  };

  const mockParams = { id: "share-1" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("enables disabled share link", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const mockShareLink = {
      id: "share-1",
      userId: "user-123",
      targetType: "WORKFLOW",
      targetId: "workflow-1",
      shareToken: "token-123",
      isActive: false,
      expiresAt: null,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink as any);
    prismaMock.sharedLink.update.mockResolvedValue({ ...mockShareLink, isActive: true } as any);

    const request = new Request("http://localhost/api/v1/share/share-1/toggle", {
      method: "PATCH",
      body: JSON.stringify({ isActive: true }),
    });

    const response = await PATCH(request, { params: mockParams });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain("enabled");
    expect(prismaMock.sharedLink.update).toHaveBeenCalledWith({
      where: { id: "share-1" },
      data: { isActive: true },
    });
  });

  it("disables enabled share link", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const mockShareLink = {
      id: "share-1",
      userId: "user-123",
      isActive: true,
    };

    prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink as any);
    prismaMock.sharedLink.update.mockResolvedValue({ ...mockShareLink, isActive: false } as any);

    const request = new Request("http://localhost/api/v1/share/share-1/toggle", {
      method: "PATCH",
      body: JSON.stringify({ isActive: false }),
    });

    const response = await PATCH(request, { params: mockParams });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toContain("disabled");
    expect(prismaMock.sharedLink.update).toHaveBeenCalledWith({
      where: { id: "share-1" },
      data: { isActive: false },
    });
  });

  it("returns 401 when not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const request = new Request("http://localhost/api/v1/share/share-1/toggle", {
      method: "PATCH",
      body: JSON.stringify({ isActive: true }),
    });

    const response = await PATCH(request, { params: mockParams });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Unauthorized");
    expect(prismaMock.sharedLink.findUnique).not.toHaveBeenCalled();
  });

  it("returns 400 when share link does not exist", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    prismaMock.sharedLink.findUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/v1/share/non-existent/toggle", {
      method: "PATCH",
      body: JSON.stringify({ isActive: true }),
    });

    const response = await PATCH(request, { params: { id: "non-existent" } });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("Share link not found");
    expect(prismaMock.sharedLink.update).not.toHaveBeenCalled();
  });

  it("returns 400 when user does not own share link", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const mockShareLink = {
      id: "share-1",
      userId: "user-456", // Different user
      isActive: true,
    };

    prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink as any);

    const request = new Request("http://localhost/api/v1/share/share-1/toggle", {
      method: "PATCH",
      body: JSON.stringify({ isActive: false }),
    });

    const response = await PATCH(request, { params: mockParams });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe("You do not own this share link");
    expect(prismaMock.sharedLink.update).not.toHaveBeenCalled();
  });

  it("returns 400 when isActive is missing", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const request = new Request("http://localhost/api/v1/share/share-1/toggle", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    const response = await PATCH(request, { params: mockParams });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it("returns 400 when isActive is not boolean", async () => {
    (auth as jest.Mock).mockResolvedValue(mockSession);

    const request = new Request("http://localhost/api/v1/share/share-1/toggle", {
      method: "PATCH",
      body: JSON.stringify({ isActive: "yes" }),
    });

    const response = await PATCH(request, { params: mockParams });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBeDefined();
  });
});
