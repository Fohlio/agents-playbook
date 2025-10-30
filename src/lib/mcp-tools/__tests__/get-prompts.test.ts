import { prismaMock } from "@/lib/db/__mocks__/client";
import { getPromptsHandler } from "../get-prompts";

jest.mock("@/lib/db/client", () => ({
  prisma: prismaMock,
}));

describe("get-prompts MCP tool", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPromptsHandler", () => {
    it("should return active system mini prompts without search", async () => {
      const mockMiniPrompts = [
        {
          id: "prompt-1",
          userId: "user-1",
          name: "Test Mini Prompt 1",
          content: "This is test content for mini prompt 1. It has some description about what it does.",
          visibility: "PUBLIC" as const,
          isActive: true,
          isSystemMiniPrompt: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          user: {
            id: "user-1",
            username: "testuser1",
          },
          _count: {
            stageMiniPrompts: 3,
            references: 5,
          },
        },
        {
          id: "prompt-2",
          userId: "user-2",
          name: "Test Mini Prompt 2",
          content: "Another test content for testing purposes.",
          visibility: "PUBLIC" as const,
          isActive: true,
          isSystemMiniPrompt: true,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
          user: {
            id: "user-2",
            username: "testuser2",
          },
          _count: {
            stageMiniPrompts: 1,
            references: 2,
          },
        },
      ];

      prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as any);

      const result = await getPromptsHandler({});

      expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          isSystemMiniPrompt: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              stageMiniPrompts: true,
              references: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: 20,
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Found 2 active system mini prompts");
      expect(result.content[0].text).toContain("Test Mini Prompt 1");
      expect(result.content[0].text).toContain("Test Mini Prompt 2");
      expect(result.content[0].text).toContain("@testuser1");
      expect(result.content[0].text).toContain("@testuser2");
      expect(result.content[0].text).toContain("Used in 3 workflows");
      expect(result.content[0].text).toContain("In 5 libraries");
    });

    it("should filter mini prompts by search term", async () => {
      const mockMiniPrompts = [
        {
          id: "prompt-1",
          userId: "user-1",
          name: "Analysis Mini Prompt",
          content: "This prompt helps with code analysis tasks.",
          visibility: "PUBLIC" as const,
          isActive: true,
          isSystemMiniPrompt: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          user: {
            id: "user-1",
            username: "testuser1",
          },
          _count: {
            stageMiniPrompts: 2,
            references: 3,
          },
        },
      ];

      prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as any);

      const result = await getPromptsHandler({ search: "analysis" });

      expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          isSystemMiniPrompt: true,
          OR: [
            { name: { contains: "analysis", mode: "insensitive" } },
            { content: { contains: "analysis", mode: "insensitive" } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          _count: {
            select: {
              stageMiniPrompts: true,
              references: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        take: 20,
      });

      expect(result.content[0].text).toContain('matching "analysis"');
      expect(result.content[0].text).toContain("Analysis Mini Prompt");
    });

    it("should return message when no mini prompts found", async () => {
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getPromptsHandler({});

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("No active system mini prompts found");
    });

    it("should return message when no mini prompts match search", async () => {
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getPromptsHandler({ search: "nonexistent" });

      expect(result.content[0].text).toContain('No active system mini prompts found matching "nonexistent"');
    });

    it("should handle content preview truncation", async () => {
      const longContent = "A".repeat(150) + "This should be truncated";
      const mockMiniPrompts = [
        {
          id: "prompt-1",
          userId: "user-1",
          name: "Long Content Prompt",
          content: longContent,
          visibility: "PUBLIC" as const,
          isActive: true,
          isSystemMiniPrompt: false,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          user: {
            id: "user-1",
            username: "testuser1",
          },
          _count: {
            stageMiniPrompts: 1,
            references: 1,
          },
        },
      ];

      prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as any);

      const result = await getPromptsHandler({});

      expect(result.content[0].text).toContain("...");
      expect(result.content[0].text).not.toContain("This should be truncated");
    });

    it("should include prompt IDs in response", async () => {
      const mockMiniPrompts = [
        {
          id: "prompt-123",
          userId: "user-1",
          name: "Test Prompt",
          content: "Test content",
          visibility: "PUBLIC" as const,
          isActive: true,
          isSystemMiniPrompt: false,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          user: {
            id: "user-1",
            username: "testuser1",
          },
          _count: {
            stageMiniPrompts: 1,
            references: 1,
          },
        },
      ];

      prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as any);

      const result = await getPromptsHandler({});

      expect(result.content[0].text).toContain("prompt-123");
      expect(result.content[0].text).toContain("get_selected_prompt");
    });

    it("should handle database errors gracefully", async () => {
      prismaMock.miniPrompt.findMany.mockRejectedValue(new Error("Database error"));

      const result = await getPromptsHandler({});

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain("Error: Failed to fetch mini prompts");
    });

    it("should respect the limit of 20 results", async () => {
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      await getPromptsHandler({});

      expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        })
      );
    });

    it("should order by createdAt descending", async () => {
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      await getPromptsHandler({});

      expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ createdAt: "desc" }],
        })
      );
    });
  });
});
