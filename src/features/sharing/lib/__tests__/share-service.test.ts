/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from "@/lib/db/__mocks__/client";
import {
  generateShareToken,
  createShareLink,
  toggleShareLink,
  regenerateShareToken,
  updateShareLinkExpiration,
  getUserSharedItems,
  getSharedContent,
} from "../share-service";
import { TargetType } from "@prisma/client";

jest.mock("@/lib/db/client", () => ({
  prisma: prismaMock,
}));

describe("share-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateShareToken", () => {
    it("should generate 32-character hex token", () => {
      const token = generateShareToken();
      expect(token).toHaveLength(32);
      expect(token).toMatch(/^[0-9a-f]{32}$/);
    });

    it("should generate unique tokens on multiple calls", () => {
      const token1 = generateShareToken();
      const token2 = generateShareToken();
      const token3 = generateShareToken();

      expect(token1).not.toBe(token2);
      expect(token2).not.toBe(token3);
      expect(token1).not.toBe(token3);
    });
  });

  describe("createShareLink", () => {
    it("should create new share link for owned workflow", async () => {
      const mockWorkflow = {
        id: "workflow-1",
        userId: "user-1",
        name: "Test Workflow",
        description: null,
        yamlContent: null,
        visibility: "PUBLIC",
        isActive: false,
        isSystemWorkflow: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.workflow.findFirst.mockResolvedValue(mockWorkflow);
      prismaMock.sharedLink.findFirst.mockResolvedValue(null);
      prismaMock.sharedLink.create.mockImplementation((args) => {
        return Promise.resolve({
          id: "share-1",
          userId: "user-1",
          targetType: "WORKFLOW" as TargetType,
          targetId: "workflow-1",
          shareToken: args.data.shareToken as string,
          isActive: true,
          expiresAt: null,
          viewCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      const result = await createShareLink("user-1", "WORKFLOW", "workflow-1");

      expect(result.success).toBe(true);
      expect(result.shareToken).toMatch(/^[0-9a-f]{32}$/);
      expect(result.message).toBe("Share link created successfully");
      expect(prismaMock.workflow.findFirst).toHaveBeenCalledWith({
        where: { id: "workflow-1", userId: "user-1" },
      });
      expect(prismaMock.sharedLink.create).toHaveBeenCalled();
    });

    it("should return existing active share link if found", async () => {
      const mockWorkflow = {
        id: "workflow-1",
        userId: "user-1",
        name: "Test Workflow",
        description: null,
        yamlContent: null,
        visibility: "PUBLIC",
        isActive: false,
        isSystemWorkflow: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "existing-token-123",
        isActive: true,
        expiresAt: null,
        viewCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.workflow.findFirst.mockResolvedValue(mockWorkflow);
      prismaMock.sharedLink.findFirst.mockResolvedValueOnce(existingShareLink);

      const result = await createShareLink("user-1", "WORKFLOW", "workflow-1");

      expect(result.success).toBe(true);
      expect(result.shareToken).toBe("existing-token-123");
      expect(result.message).toBe("Share link already exists");
      expect(prismaMock.sharedLink.create).not.toHaveBeenCalled();
    });

    it("should reject creation for non-owned workflow", async () => {
      prismaMock.workflow.findFirst.mockResolvedValue(null);

      const result = await createShareLink("user-1", "WORKFLOW", "workflow-1");

      expect(result.success).toBe(false);
      expect(result.shareToken).toBeUndefined();
      expect(result.message).toBe("You do not own this item");
      expect(prismaMock.sharedLink.create).not.toHaveBeenCalled();
    });

    it("should create share link with expiration date", async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const mockMiniPrompt = {
        id: "mini-prompt-1",
        userId: "user-1",
        name: "Test Mini Prompt",
        content: "Content",
        visibility: "PRIVATE",
        isSystemMiniPrompt: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "MINI_PROMPT" as TargetType,
        targetId: "mini-prompt-1",
        shareToken: "token-with-expiry",
        isActive: true,
        expiresAt: expiresAt,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.miniPrompt.findFirst.mockResolvedValue(mockMiniPrompt);
      prismaMock.sharedLink.findFirst.mockResolvedValue(null);
      prismaMock.sharedLink.create.mockResolvedValue(mockShareLink);

      const result = await createShareLink("user-1", "MINI_PROMPT", "mini-prompt-1", expiresAt);

      expect(result.success).toBe(true);
      expect(prismaMock.sharedLink.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          targetType: "MINI_PROMPT",
          targetId: "mini-prompt-1",
          shareToken: expect.stringMatching(/^[0-9a-f]{32}$/),
          expiresAt: expiresAt,
        },
      });
    });

    it("should reject when target does not exist", async () => {
      prismaMock.workflow.findFirst.mockResolvedValue(null);

      const result = await createShareLink("user-1", "WORKFLOW", "non-existent");

      expect(result.success).toBe(false);
      expect(result.message).toBe("You do not own this item");
    });
  });

  describe("toggleShareLink", () => {
    it("should enable disabled share link", async () => {
      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "token-123",
        isActive: false,
        expiresAt: null,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedShareLink = {
        ...mockShareLink,
        isActive: true,
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);
      prismaMock.sharedLink.update.mockResolvedValue(updatedShareLink);

      const result = await toggleShareLink("user-1", "share-1", true);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Share link enabled successfully");
      expect(prismaMock.sharedLink.update).toHaveBeenCalledWith({
        where: { id: "share-1" },
        data: { isActive: true },
      });
    });

    it("should disable enabled share link", async () => {
      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "token-123",
        isActive: true,
        expiresAt: null,
        viewCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedShareLink = {
        ...mockShareLink,
        isActive: false,
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);
      prismaMock.sharedLink.update.mockResolvedValue(updatedShareLink);

      const result = await toggleShareLink("user-1", "share-1", false);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Share link disabled successfully");
      expect(prismaMock.sharedLink.update).toHaveBeenCalledWith({
        where: { id: "share-1" },
        data: { isActive: false },
      });
    });

    it("should reject toggle for non-owned share link", async () => {
      const mockShareLink = {
        id: "share-1",
        userId: "user-2",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "token-123",
        isActive: true,
        expiresAt: null,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);

      const result = await toggleShareLink("user-1", "share-1", false);

      expect(result.success).toBe(false);
      expect(result.message).toBe("You do not own this share link");
      expect(prismaMock.sharedLink.update).not.toHaveBeenCalled();
    });

    it("should reject when share link does not exist", async () => {
      prismaMock.sharedLink.findUnique.mockResolvedValue(null);

      const result = await toggleShareLink("user-1", "non-existent", true);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Share link not found");
    });
  });

  describe("regenerateShareToken", () => {
    it("should generate new token for owned share link", async () => {
      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "old-token-123",
        isActive: true,
        expiresAt: null,
        viewCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);
      prismaMock.sharedLink.update.mockImplementation((args) => {
        return Promise.resolve({
          ...mockShareLink,
          shareToken: args.data.shareToken as string,
        });
      });

      const result = await regenerateShareToken("user-1", "share-1");

      expect(result.success).toBe(true);
      expect(result.shareToken).toMatch(/^[0-9a-f]{32}$/);
      expect(result.shareToken).not.toBe("old-token-123");
      expect(result.message).toBe("Share token regenerated successfully");
      expect(prismaMock.sharedLink.update).toHaveBeenCalled();
    });

    it("should reject regeneration for non-owned share link", async () => {
      const mockShareLink = {
        id: "share-1",
        userId: "user-2",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "token-123",
        isActive: true,
        expiresAt: null,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);

      const result = await regenerateShareToken("user-1", "share-1");

      expect(result.success).toBe(false);
      expect(result.shareToken).toBeUndefined();
      expect(result.message).toBe("You do not own this share link");
    });

    it("should reject when share link does not exist", async () => {
      prismaMock.sharedLink.findUnique.mockResolvedValue(null);

      const result = await regenerateShareToken("user-1", "non-existent");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Share link not found");
    });
  });

  describe("updateShareLinkExpiration", () => {
    it("should update expiration date", async () => {
      const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "token-123",
        isActive: true,
        expiresAt: null,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedShareLink = {
        ...mockShareLink,
        expiresAt: newExpiresAt,
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);
      prismaMock.sharedLink.update.mockResolvedValue(updatedShareLink);

      const result = await updateShareLinkExpiration("user-1", "share-1", newExpiresAt);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Expiration updated successfully");
      expect(prismaMock.sharedLink.update).toHaveBeenCalledWith({
        where: { id: "share-1" },
        data: { expiresAt: newExpiresAt },
      });
    });

    it("should remove expiration by setting to null", async () => {
      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "MINI_PROMPT" as TargetType,
        targetId: "mini-prompt-1",
        shareToken: "token-123",
        isActive: true,
        expiresAt: new Date(),
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedShareLink = {
        ...mockShareLink,
        expiresAt: null,
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);
      prismaMock.sharedLink.update.mockResolvedValue(updatedShareLink);

      const result = await updateShareLinkExpiration("user-1", "share-1", null);

      expect(result.success).toBe(true);
      expect(prismaMock.sharedLink.update).toHaveBeenCalledWith({
        where: { id: "share-1" },
        data: { expiresAt: null },
      });
    });

    it("should reject update for non-owned share link", async () => {
      const mockShareLink = {
        id: "share-1",
        userId: "user-2",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "token-123",
        isActive: true,
        expiresAt: null,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);

      const result = await updateShareLinkExpiration("user-1", "share-1", new Date());

      expect(result.success).toBe(false);
      expect(result.message).toBe("You do not own this share link");
    });
  });

  describe("getUserSharedItems", () => {
    it("should return enriched shared items for workflows", async () => {
      const mockWorkflow = {
        id: "workflow-1",
        name: "Test Workflow",
        visibility: "PUBLIC",
      };

      const mockSharedLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "token-123",
        isActive: true,
        expiresAt: null,
        viewCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findMany.mockResolvedValue([mockSharedLink]);
      prismaMock.workflow.findUnique.mockResolvedValue(mockWorkflow as any);

      const result = await getUserSharedItems("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("share-1");
      expect(result[0].targetName).toBe("Test Workflow");
      expect(result[0].targetVisibility).toBe("PUBLIC");
      expect(result[0].viewCount).toBe(10);
    });

    it("should return enriched shared items for mini-prompts", async () => {
      const mockMiniPrompt = {
        id: "mini-prompt-1",
        name: "Test Mini Prompt",
        visibility: "PRIVATE",
      };

      const mockSharedLink = {
        id: "share-2",
        userId: "user-1",
        targetType: "MINI_PROMPT" as TargetType,
        targetId: "mini-prompt-1",
        shareToken: "token-456",
        isActive: false,
        expiresAt: new Date(Date.now() + 1000),
        viewCount: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findMany.mockResolvedValue([mockSharedLink]);
      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as any);

      const result = await getUserSharedItems("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].targetName).toBe("Test Mini Prompt");
      expect(result[0].targetVisibility).toBe("PRIVATE");
      expect(result[0].isActive).toBe(false);
    });

    it("should return empty array when user has no shared items", async () => {
      prismaMock.sharedLink.findMany.mockResolvedValue([]);

      const result = await getUserSharedItems("user-1");

      expect(result).toEqual([]);
    });

    it("should handle multiple shared items", async () => {
      const mockSharedLinks = [
        {
          id: "share-1",
          userId: "user-1",
          targetType: "WORKFLOW" as TargetType,
          targetId: "workflow-1",
          shareToken: "token-1",
          isActive: true,
          expiresAt: null,
          viewCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "share-2",
          userId: "user-1",
          targetType: "MINI_PROMPT" as TargetType,
          targetId: "mini-prompt-1",
          shareToken: "token-2",
          isActive: true,
          expiresAt: null,
          viewCount: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.sharedLink.findMany.mockResolvedValue(mockSharedLinks);
      prismaMock.workflow.findUnique.mockResolvedValue({ id: "workflow-1", name: "Workflow", visibility: "PUBLIC" } as any);
      prismaMock.miniPrompt.findUnique.mockResolvedValue({ id: "mini-prompt-1", name: "Mini Prompt", visibility: "PRIVATE" } as any);

      const result = await getUserSharedItems("user-1");

      expect(result).toHaveLength(2);
      expect(result[0].targetType).toBe("WORKFLOW");
      expect(result[1].targetType).toBe("MINI_PROMPT");
    });
  });

  describe("getSharedContent", () => {
    it("should return workflow with valid active token", async () => {
      const mockWorkflow = {
        id: "workflow-1",
        userId: "user-1",
        name: "Test Workflow",
        description: "Description",
        yamlContent: null,
        visibility: "PUBLIC",
        isActive: true,
        isSystemWorkflow: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        stages: [],
      };

      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "valid-token",
        isActive: true,
        expiresAt: null,
        viewCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);
      prismaMock.workflow.findUnique.mockResolvedValue(mockWorkflow);
      prismaMock.sharedLink.update.mockResolvedValue({ ...mockShareLink, viewCount: 6 });

      const result = await getSharedContent("valid-token", true);

      expect(result.success).toBe(true);
      expect(result.targetType).toBe("WORKFLOW");
      expect(result.content).toEqual(mockWorkflow);
      expect(prismaMock.sharedLink.update).toHaveBeenCalledWith({
        where: { id: "share-1" },
        data: { viewCount: { increment: 1 } },
      });
    });

    it("should return mini-prompt with valid active token", async () => {
      const mockMiniPrompt = {
        id: "mini-prompt-1",
        userId: "user-1",
        name: "Test Mini Prompt",
        content: "# Test Content",
        visibility: "PRIVATE",
        isSystemMiniPrompt: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "MINI_PROMPT" as TargetType,
        targetId: "mini-prompt-1",
        shareToken: "valid-token-mini",
        isActive: true,
        expiresAt: null,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);
      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt);
      prismaMock.sharedLink.update.mockResolvedValue({ ...mockShareLink, viewCount: 1 });

      const result = await getSharedContent("valid-token-mini");

      expect(result.success).toBe(true);
      expect(result.targetType).toBe("MINI_PROMPT");
      expect(result.content).toEqual(mockMiniPrompt);
    });

    it("should reject invalid token", async () => {
      prismaMock.sharedLink.findUnique.mockResolvedValue(null);

      const result = await getSharedContent("invalid-token");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Share link not found");
      expect(result.content).toBeUndefined();
    });

    it("should reject inactive share link", async () => {
      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "disabled-token",
        isActive: false,
        expiresAt: null,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);

      const result = await getSharedContent("disabled-token");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Share link is disabled");
      expect(prismaMock.sharedLink.update).not.toHaveBeenCalled();
    });

    it("should reject expired share link", async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "expired-token",
        isActive: true,
        expiresAt: pastDate,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);

      const result = await getSharedContent("expired-token");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Share link has expired");
    });

    it("should not increment view count when incrementView is false", async () => {
      const mockWorkflow = {
        id: "workflow-1",
        userId: "user-1",
        name: "Test Workflow",
        description: null,
        yamlContent: null,
        visibility: "PUBLIC",
        isActive: true,
        isSystemWorkflow: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        stages: [],
      };

      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "token-no-increment",
        isActive: true,
        expiresAt: null,
        viewCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);
      prismaMock.workflow.findUnique.mockResolvedValue(mockWorkflow);

      const result = await getSharedContent("token-no-increment", false);

      expect(result.success).toBe(true);
      expect(prismaMock.sharedLink.update).not.toHaveBeenCalled();
    });

    it("should accept future expiration date", async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const mockWorkflow = {
        id: "workflow-1",
        userId: "user-1",
        name: "Test Workflow",
        description: null,
        yamlContent: null,
        visibility: "PUBLIC",
        isActive: true,
        isSystemWorkflow: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        stages: [],
      };

      const mockShareLink = {
        id: "share-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        shareToken: "future-expiry-token",
        isActive: true,
        expiresAt: futureDate,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.sharedLink.findUnique.mockResolvedValue(mockShareLink);
      prismaMock.workflow.findUnique.mockResolvedValue(mockWorkflow);
      prismaMock.sharedLink.update.mockResolvedValue({ ...mockShareLink, viewCount: 1 });

      const result = await getSharedContent("future-expiry-token");

      expect(result.success).toBe(true);
      expect(result.content).toEqual(mockWorkflow);
    });
  });
});
