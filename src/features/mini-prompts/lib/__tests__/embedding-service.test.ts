import { prismaMock } from "@/server/db/__mocks__/client";
import { generateMiniPromptEmbedding, triggerMiniPromptEmbedding } from "../embedding-service";

// Mock OpenAI
jest.mock("openai", () => {
  const create = jest.fn();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      embeddings: {
        create,
      },
    })),
  };
});

// Get the mocked create function
let mockCreateFn: jest.Mock;
beforeAll(async () => {
  const { default: OpenAI } = await import("openai");
  const instance = new OpenAI();
  mockCreateFn = instance.embeddings.create as jest.Mock;
});

jest.mock("@/server/db/client", () => ({
  prisma: prismaMock,
}));

describe("embedding-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe("generateMiniPromptEmbedding", () => {
    it("should generate and store embedding for mini-prompt with description", async () => {
      const mockMiniPrompt = {
        id: "mini-prompt-1",
        name: "Test Mini-Prompt",
        description: "Test description",
        content: "Test content",
        tags: [
          { tag: { name: "testing" } },
          { tag: { name: "example" } }
        ],
      };

      const mockEmbedding = [0.1, 0.2, 0.3];

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as unknown as Awaited<ReturnType<typeof prismaMock.miniPrompt.findUnique>>);
      mockCreateFn.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });
      prismaMock.miniPromptEmbedding.upsert.mockResolvedValue({
        id: "embedding-1",
        miniPromptId: "mini-prompt-1",
        embedding: mockEmbedding,
        searchText: "test mini-prompt test description test content testing example",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Awaited<ReturnType<typeof prismaMock.miniPromptEmbedding.upsert>>);

      await generateMiniPromptEmbedding("mini-prompt-1");

      expect(prismaMock.miniPrompt.findUnique).toHaveBeenCalledWith({
        where: { id: "mini-prompt-1" },
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
          tags: {
            include: {
              tag: {
                select: {
                  name: true
                }
              }
            }
          }
        },
      });

      expect(mockCreateFn).toHaveBeenCalledWith({
        model: "text-embedding-3-small",
        input: "test mini-prompt test description test content testing example",
        dimensions: 1536,
      });

      expect(prismaMock.miniPromptEmbedding.upsert).toHaveBeenCalledWith({
        where: { miniPromptId: "mini-prompt-1" },
        create: {
          miniPromptId: "mini-prompt-1",
          embedding: mockEmbedding,
          searchText: "test mini-prompt test description test content testing example",
        },
        update: {
          embedding: mockEmbedding,
          searchText: "test mini-prompt test description test content testing example",
        },
      });
    });

    it("should handle mini-prompt without description", async () => {
      const mockMiniPrompt = {
        id: "mini-prompt-2",
        name: "No Description",
        description: null,
        content: "Just content",
        tags: [],
      };

      const mockEmbedding = [0.1, 0.2, 0.3];

      prismaMock.miniPrompt.findUnique.mockResolvedValue(mockMiniPrompt as unknown as Awaited<ReturnType<typeof prismaMock.miniPrompt.findUnique>>);
      mockCreateFn.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });
      prismaMock.miniPromptEmbedding.upsert.mockResolvedValue({} as unknown as Awaited<ReturnType<typeof prismaMock.miniPromptEmbedding.upsert>>);

      await generateMiniPromptEmbedding("mini-prompt-2");

      expect(mockCreateFn).toHaveBeenCalledWith({
        model: "text-embedding-3-small",
        input: "no description  just content",
        dimensions: 1536,
      });
    });

    it("should skip if OpenAI API key is not configured", async () => {
      delete process.env.OPENAI_API_KEY;
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await generateMiniPromptEmbedding("mini-prompt-1");

      expect(consoleSpy).toHaveBeenCalledWith(
        "OpenAI API key not configured, skipping embedding generation"
      );
      expect(prismaMock.miniPrompt.findUnique).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle mini-prompt not found", async () => {
      prismaMock.miniPrompt.findUnique.mockResolvedValue(null);
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await generateMiniPromptEmbedding("non-existent");

      expect(consoleSpy).toHaveBeenCalledWith("Mini-prompt non-existent not found");
      expect(mockCreateFn).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle errors gracefully", async () => {
      prismaMock.miniPrompt.findUnique.mockRejectedValue(new Error("Database error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await generateMiniPromptEmbedding("mini-prompt-1");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to generate embedding for mini-prompt mini-prompt-1:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("triggerMiniPromptEmbedding", () => {
    it("should call generateMiniPromptEmbedding without waiting", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      // This should return immediately without throwing
      const result = triggerMiniPromptEmbedding("mini-prompt-1");

      // Should return void/undefined immediately
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it("should handle errors in background without throwing", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // This should not throw
      expect(() => {
        triggerMiniPromptEmbedding("mini-prompt-1");
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});
