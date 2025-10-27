import { prismaMock } from "@/lib/db/__mocks__/client";
import {
  upsertRating,
  getRatingStats,
  getRatingStatsForMultiple,
  getUserRating,
  canUserRate,
} from "../rating-service";
import { TargetType } from "@prisma/client";

jest.mock("@/lib/db/client", () => ({
  prisma: prismaMock,
}));

describe("rating-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("upsertRating", () => {
    it("should create a new rating", async () => {
      const mockRating = {
        id: "rating-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        rating: 5,
        createdAt: new Date(),
      };

      prismaMock.workflow.findUnique.mockResolvedValue({
        id: "workflow-1",
        userId: "user-2",
        name: "Test Workflow",
        description: null,
        yamlContent: null,
        visibility: "PUBLIC",
        isActive: false,
        isSystemWorkflow: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.rating.upsert.mockResolvedValue(mockRating);

      const result = await upsertRating({
        userId: "user-1",
        targetType: "WORKFLOW",
        targetId: "workflow-1",
        rating: 5,
      });

      expect(result).toEqual(mockRating);
      expect(prismaMock.rating.upsert).toHaveBeenCalledWith({
        where: {
          userId_targetType_targetId: {
            userId: "user-1",
            targetType: "WORKFLOW",
            targetId: "workflow-1",
          },
        },
        create: {
          userId: "user-1",
          targetType: "WORKFLOW",
          targetId: "workflow-1",
          rating: 5,
        },
        update: {
          rating: 5,
        },
      });
    });

    it("should update existing rating", async () => {
      const mockUpdatedRating = {
        id: "rating-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        rating: 4,
        createdAt: new Date(),
      };

      prismaMock.workflow.findUnique.mockResolvedValue({
        id: "workflow-1",
        userId: "user-2",
        name: "Test Workflow",
        description: null,
        yamlContent: null,
        visibility: "PUBLIC",
        isActive: false,
        isSystemWorkflow: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.rating.upsert.mockResolvedValue(mockUpdatedRating);

      const result = await upsertRating({
        userId: "user-1",
        targetType: "WORKFLOW",
        targetId: "workflow-1",
        rating: 4,
      });

      expect(result.rating).toBe(4);
      expect(prismaMock.rating.upsert).toHaveBeenCalledWith({
        where: {
          userId_targetType_targetId: {
            userId: "user-1",
            targetType: "WORKFLOW",
            targetId: "workflow-1",
          },
        },
        create: {
          userId: "user-1",
          targetType: "WORKFLOW",
          targetId: "workflow-1",
          rating: 4,
        },
        update: {
          rating: 4,
        },
      });
    });

    it("should reject rating below 1", async () => {
      await expect(
        upsertRating({
          userId: "user-1",
          targetType: "WORKFLOW",
          targetId: "workflow-1",
          rating: 0,
        })
      ).rejects.toThrow("Rating must be between 1 and 5");

      expect(prismaMock.rating.upsert).not.toHaveBeenCalled();
    });

    it("should reject rating above 5", async () => {
      await expect(
        upsertRating({
          userId: "user-1",
          targetType: "WORKFLOW",
          targetId: "workflow-1",
          rating: 6,
        })
      ).rejects.toThrow("Rating must be between 1 and 5");

      expect(prismaMock.rating.upsert).not.toHaveBeenCalled();
    });

    it("should prevent user from rating their own workflow", async () => {
      prismaMock.workflow.findUnique.mockResolvedValue({
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
      });

      await expect(
        upsertRating({
          userId: "user-1",
          targetType: "WORKFLOW",
          targetId: "workflow-1",
          rating: 5,
        })
      ).rejects.toThrow("You cannot rate your own content");

      expect(prismaMock.rating.upsert).not.toHaveBeenCalled();
    });

    it("should prevent user from rating their own mini-prompt", async () => {
      prismaMock.miniPrompt.findUnique.mockResolvedValue({
        id: "mini-prompt-1",
        userId: "user-1",
        name: "Test Mini Prompt",
        content: "Content",
        visibility: "PUBLIC",
        isSystemMiniPrompt: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        upsertRating({
          userId: "user-1",
          targetType: "MINI_PROMPT",
          targetId: "mini-prompt-1",
          rating: 5,
        })
      ).rejects.toThrow("You cannot rate your own content");

      expect(prismaMock.rating.upsert).not.toHaveBeenCalled();
    });
  });

  describe("getRatingStats", () => {
    it("should return rating statistics", async () => {
      prismaMock.rating.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { id: 10 },
        _max: {},
        _min: {},
        _sum: {},
      });

      const result = await getRatingStats("WORKFLOW", "workflow-1");

      expect(result).toEqual({
        averageRating: 4.5,
        totalRatings: 10,
      });

      expect(prismaMock.rating.aggregate).toHaveBeenCalledWith({
        where: {
          targetType: "WORKFLOW",
          targetId: "workflow-1",
        },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });
    });

    it("should return zero average when no ratings exist", async () => {
      prismaMock.rating.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { id: 0 },
        _max: {},
        _min: {},
        _sum: {},
      });

      const result = await getRatingStats("WORKFLOW", "workflow-1");

      expect(result).toEqual({
        averageRating: 0,
        totalRatings: 0,
      });
    });

    it("should handle mini-prompt ratings", async () => {
      prismaMock.rating.aggregate.mockResolvedValue({
        _avg: { rating: 3.8 },
        _count: { id: 5 },
        _max: {},
        _min: {},
        _sum: {},
      });

      const result = await getRatingStats("MINI_PROMPT", "mini-prompt-1");

      expect(result).toEqual({
        averageRating: 3.8,
        totalRatings: 5,
      });
    });
  });

  describe("getRatingStatsForMultiple", () => {
    it("should return rating stats for multiple items", async () => {
      prismaMock.rating.groupBy.mockResolvedValue([
        {
          targetId: "workflow-1",
          _avg: { rating: 4.5 },
          _count: { id: 10 },
        },
        {
          targetId: "workflow-2",
          _avg: { rating: 3.7 },
          _count: { id: 5 },
        },
      ]);

      const result = await getRatingStatsForMultiple("WORKFLOW", [
        "workflow-1",
        "workflow-2",
      ]);

      expect(result).toEqual({
        "workflow-1": {
          averageRating: 4.5,
          totalRatings: 10,
        },
        "workflow-2": {
          averageRating: 3.7,
          totalRatings: 5,
        },
      });

      expect(prismaMock.rating.groupBy).toHaveBeenCalledWith({
        by: ["targetId"],
        where: {
          targetType: "WORKFLOW",
          targetId: {
            in: ["workflow-1", "workflow-2"],
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });
    });

    it("should return empty object when no target IDs provided", async () => {
      const result = await getRatingStatsForMultiple("WORKFLOW", []);

      expect(result).toEqual({});
      expect(prismaMock.rating.groupBy).not.toHaveBeenCalled();
    });

    it("should handle items with no ratings", async () => {
      prismaMock.rating.groupBy.mockResolvedValue([
        {
          targetId: "workflow-1",
          _avg: { rating: 4.5 },
          _count: { id: 10 },
        },
      ]);

      const result = await getRatingStatsForMultiple("WORKFLOW", [
        "workflow-1",
        "workflow-2",
        "workflow-3",
      ]);

      expect(result).toEqual({
        "workflow-1": {
          averageRating: 4.5,
          totalRatings: 10,
        },
      });
    });

    it("should handle null average ratings", async () => {
      prismaMock.rating.groupBy.mockResolvedValue([
        {
          targetId: "workflow-1",
          _avg: { rating: null },
          _count: { id: 0 },
        },
      ]);

      const result = await getRatingStatsForMultiple("WORKFLOW", ["workflow-1"]);

      expect(result).toEqual({
        "workflow-1": {
          averageRating: 0,
          totalRatings: 0,
        },
      });
    });
  });

  describe("getUserRating", () => {
    it("should return user rating if exists", async () => {
      const mockRating = {
        id: "rating-1",
        userId: "user-1",
        targetType: "WORKFLOW" as TargetType,
        targetId: "workflow-1",
        rating: 5,
        createdAt: new Date(),
      };

      prismaMock.rating.findUnique.mockResolvedValue(mockRating);

      const result = await getUserRating("user-1", "WORKFLOW", "workflow-1");

      expect(result).toEqual(mockRating);
      expect(prismaMock.rating.findUnique).toHaveBeenCalledWith({
        where: {
          userId_targetType_targetId: {
            userId: "user-1",
            targetType: "WORKFLOW",
            targetId: "workflow-1",
          },
        },
      });
    });

    it("should return null if user has not rated", async () => {
      prismaMock.rating.findUnique.mockResolvedValue(null);

      const result = await getUserRating("user-1", "WORKFLOW", "workflow-1");

      expect(result).toBeNull();
    });

    it("should handle mini-prompt ratings", async () => {
      const mockRating = {
        id: "rating-1",
        userId: "user-1",
        targetType: "MINI_PROMPT" as TargetType,
        targetId: "mini-prompt-1",
        rating: 4,
        createdAt: new Date(),
      };

      prismaMock.rating.findUnique.mockResolvedValue(mockRating);

      const result = await getUserRating("user-1", "MINI_PROMPT", "mini-prompt-1");

      expect(result).toEqual(mockRating);
    });
  });

  describe("canUserRate", () => {
    it("should return true when user can rate workflow", async () => {
      prismaMock.workflow.findUnique.mockResolvedValue({
        id: "workflow-1",
        userId: "user-2",
        name: "Test Workflow",
        description: null,
        yamlContent: null,
        visibility: "PUBLIC",
        isActive: false,
        isSystemWorkflow: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await canUserRate("user-1", "WORKFLOW", "workflow-1");

      expect(result).toBe(true);
      expect(prismaMock.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: "workflow-1" },
        select: { userId: true },
      });
    });

    it("should return false when user owns the workflow", async () => {
      prismaMock.workflow.findUnique.mockResolvedValue({
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
      });

      const result = await canUserRate("user-1", "WORKFLOW", "workflow-1");

      expect(result).toBe(false);
    });

    it("should return false when workflow does not exist", async () => {
      prismaMock.workflow.findUnique.mockResolvedValue(null);

      const result = await canUserRate("user-1", "WORKFLOW", "workflow-1");

      expect(result).toBe(false);
    });

    it("should return true when user can rate mini-prompt", async () => {
      prismaMock.miniPrompt.findUnique.mockResolvedValue({
        id: "mini-prompt-1",
        userId: "user-2",
        name: "Test Mini Prompt",
        content: "Content",
        visibility: "PUBLIC",
        isSystemMiniPrompt: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await canUserRate("user-1", "MINI_PROMPT", "mini-prompt-1");

      expect(result).toBe(true);
      expect(prismaMock.miniPrompt.findUnique).toHaveBeenCalledWith({
        where: { id: "mini-prompt-1" },
        select: { userId: true },
      });
    });

    it("should return false when user owns the mini-prompt", async () => {
      prismaMock.miniPrompt.findUnique.mockResolvedValue({
        id: "mini-prompt-1",
        userId: "user-1",
        name: "Test Mini Prompt",
        content: "Content",
        visibility: "PUBLIC",
        isSystemMiniPrompt: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await canUserRate("user-1", "MINI_PROMPT", "mini-prompt-1");

      expect(result).toBe(false);
    });

    it("should return false when mini-prompt does not exist", async () => {
      prismaMock.miniPrompt.findUnique.mockResolvedValue(null);

      const result = await canUserRate("user-1", "MINI_PROMPT", "mini-prompt-1");

      expect(result).toBe(false);
    });
  });
});
