/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from "@/server/db/__mocks__/client";
import { getSelectedPromptHandler } from "../get-selected-prompt";

jest.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("get-selected-prompt MCP tool", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSelectedPromptHandler", () => {
    it("should return complete mini prompt details", async () => {
      const mockMiniPrompt = {
        id: "prompt-1",
        userId: "user-1",
        name: "Test Mini Prompt",
        content: "# Test Mini Prompt\n\n## Purpose\nThis is a test mini prompt for testing purposes.\n\n## Steps\n1. First step\n2. Second step",
        visibility: "PUBLIC" as const,
        isActive: true,
        isSystemMiniPrompt: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        user: {
          id: "user-1",
          username: "testuser1",
        },
        _count: {
          stageMiniPrompts: 5,
          references: 10,
        },
      };

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as any);

      const result = await getSelectedPromptHandler({ prompt_id: "prompt-1" });

      expect(prismaMock.miniPrompt.findUnique).toHaveBeenCalledWith({
        where: {
          id: "prompt-1",
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
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("## 📝 Test Mini Prompt");
      expect(result.content[0].text).toContain("✅ Active");
      expect(result.content[0].text).toContain("🌍 Public");
      expect(result.content[0].text).toContain("@testuser1");
      expect(result.content[0].text).toContain("Used in Workflows:** 5");
      expect(result.content[0].text).toContain("In User Libraries:** 10");
      expect(result.content[0].text).toContain("# Test Mini Prompt");
      expect(result.content[0].text).toContain("## Purpose");
    });

    it("should show inactive status for inactive prompts", async () => {
      const mockMiniPrompt = {
        id: "prompt-1",
        userId: "user-1",
        name: "Inactive Prompt",
        content: "Test content",
        visibility: "PUBLIC" as const,
        isActive: false,
        isSystemMiniPrompt: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        user: {
          id: "user-1",
          username: "testuser1",
        },
        _count: {
          stageMiniPrompts: 0,
          references: 0,
        },
      };

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as any);

      const result = await getSelectedPromptHandler({ prompt_id: "prompt-1" });

      expect(result.content[0].text).toContain("⚠️ Inactive");
    });

    it("should show private visibility for private prompts", async () => {
      const mockMiniPrompt = {
        id: "prompt-1",
        userId: "user-1",
        name: "Private Prompt",
        content: "Test content",
        visibility: "PRIVATE" as const,
        isActive: true,
        isSystemMiniPrompt: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        user: {
          id: "user-1",
          username: "testuser1",
        },
        _count: {
          stageMiniPrompts: 0,
          references: 0,
        },
      };

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as any);

      const result = await getSelectedPromptHandler({ prompt_id: "prompt-1" });

      expect(result.content[0].text).toContain("🔒 Private");
    });

    it("should return error when mini prompt not found", async () => {
      prismaMock.miniPrompt.findUnique.mockResolvedValue(null);

      const result = await getSelectedPromptHandler({ prompt_id: "nonexistent" });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("❌ **Mini prompt not found**");
      expect(result.content[0].text).toContain('"nonexistent"');
      expect(result.content[0].text).toContain("get_prompts");
    });

    it("should reject automatic prompts (Memory Board, Multi-Agent Chat)", async () => {
      const mockAutomaticPrompt = {
        id: "auto-prompt-1",
        userId: "system-user",
        name: "Handoff Memory Board",
        content: "Automatic prompt content",
        visibility: "PUBLIC" as const,
        isActive: true,
        isSystemMiniPrompt: true,
        isAutomatic: true,  // This is an automatic prompt
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        user: {
          id: "system-user",
          username: "system",
        },
        _count: {
          stageMiniPrompts: 0,
          references: 0,
        },
      };

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockAutomaticPrompt as any);

      const result = await getSelectedPromptHandler({ prompt_id: "auto-prompt-1" });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("❌ **Automatic prompt not accessible**");
      expect(result.content[0].text).toContain('"auto-prompt-1"');
      expect(result.content[0].text).toContain("Memory Board");
      expect(result.content[0].text).toContain("Multi-Agent Chat");
      expect(result.content[0].text).toContain("auto-injected");
      expect(result.content[0].text).toContain("get_prompts");
    });

    it("should include full markdown content in response", async () => {
      const longContent = `# Detailed Mini Prompt

## Purpose
This is a comprehensive mini prompt with multiple sections.

## Prerequisites
- Requirement 1
- Requirement 2

## Process
1. Step one with detailed instructions
2. Step two with more details
3. Step three to complete the task

## Expected Output
The final result should include...`;

      const mockMiniPrompt = {
        id: "prompt-1",
        userId: "user-1",
        name: "Detailed Prompt",
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
          stageMiniPrompts: 2,
          references: 3,
        },
      };

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as any);

      const result = await getSelectedPromptHandler({ prompt_id: "prompt-1" });

      expect(result.content[0].text).toContain(longContent);
      expect(result.content[0].text).toContain("## Prerequisites");
      expect(result.content[0].text).toContain("## Process");
      expect(result.content[0].text).toContain("## Expected Output");
    });

    it("should format dates in readable format", async () => {
      const mockMiniPrompt = {
        id: "prompt-1",
        userId: "user-1",
        name: "Test Prompt",
        content: "Test content",
        visibility: "PUBLIC" as const,
        isActive: true,
        isSystemMiniPrompt: false,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-02-20"),
        user: {
          id: "user-1",
          username: "testuser1",
        },
        _count: {
          stageMiniPrompts: 1,
          references: 1,
        },
      };

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as any);

      const result = await getSelectedPromptHandler({ prompt_id: "prompt-1" });

      expect(result.content[0].text).toContain("**Created:**");
      expect(result.content[0].text).toContain("**Last Updated:**");
      // Dates should be formatted as locale strings
      expect(result.content[0].text).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("should include usage instructions", async () => {
      const mockMiniPrompt = {
        id: "prompt-1",
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
      };

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as any);

      const result = await getSelectedPromptHandler({ prompt_id: "prompt-1" });

      expect(result.content[0].text).toContain("**💡 How to Use:**");
      expect(result.content[0].text).toContain("reusable component");
      expect(result.content[0].text).toContain("workflows");
    });

    it("should handle database errors gracefully", async () => {
      prismaMock.miniPrompt.findUnique.mockRejectedValue(new Error("Database connection lost"));

      const result = await getSelectedPromptHandler({ prompt_id: "prompt-1" });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain("❌ **Error retrieving mini prompt");
      expect(result.content[0].text).toContain('"prompt-1"');
      expect(result.content[0].text).toContain("get_prompts");
    });

    it("should display zero counts correctly", async () => {
      const mockMiniPrompt = {
        id: "prompt-1",
        userId: "user-1",
        name: "New Prompt",
        content: "Brand new prompt with no usage yet",
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
          stageMiniPrompts: 0,
          references: 0,
        },
      };

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as any);

      const result = await getSelectedPromptHandler({ prompt_id: "prompt-1" });

      expect(result.content[0].text).toContain("Used in Workflows:** 0");
      expect(result.content[0].text).toContain("In User Libraries:** 0");
    });

    it("should include all required metadata fields", async () => {
      const mockMiniPrompt = {
        id: "prompt-1",
        userId: "user-1",
        name: "Complete Metadata Prompt",
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
          stageMiniPrompts: 3,
          references: 7,
        },
      };

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as any);

      const result = await getSelectedPromptHandler({ prompt_id: "prompt-1" });

      const text = result.content[0].text;
      expect(text).toContain("**Status:**");
      expect(text).toContain("**Visibility:**");
      expect(text).toContain("**Author:**");
      expect(text).toContain("**Used in Workflows:**");
      expect(text).toContain("**In User Libraries:**");
      expect(text).toContain("**Created:**");
      expect(text).toContain("**Last Updated:**");
    });
  });
});
