import OpenAI from "openai";
import { prisma } from "@/lib/db/client";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate and store embedding for a mini-prompt
 * This is designed to be fire-and-forget to avoid blocking the UI
 */
export async function generateMiniPromptEmbedding(miniPromptId: string): Promise<void> {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      console.warn("OpenAI API key not configured, skipping embedding generation");
      return;
    }

    // Fetch mini-prompt with tags
    const miniPrompt = await prisma.miniPrompt.findUnique({
      where: { id: miniPromptId },
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

    if (!miniPrompt) {
      console.warn(`Mini-prompt ${miniPromptId} not found`);
      return;
    }

    // Build searchable text from name, description, content, and tags
    const tagNames = miniPrompt.tags?.map(mpt => mpt.tag.name) || [];
    const searchText = [
      miniPrompt.name,
      miniPrompt.description || "",
      miniPrompt.content,
      ...tagNames
    ]
      .join(" ")
      .toLowerCase();

    // Generate embedding using OpenAI
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: searchText,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const embedding = response.data[0].embedding;

    // Store embedding in database (upsert to handle updates)
    await prisma.miniPromptEmbedding.upsert({
      where: { miniPromptId },
      create: {
        miniPromptId,
        embedding,
        searchText,
      },
      update: {
        embedding,
        searchText,
      },
    });

    console.log(`✅ Generated embedding for mini-prompt: ${miniPrompt.name}`);
  } catch (error) {
    console.error(`Failed to generate embedding for mini-prompt ${miniPromptId}:`, error);
  }
}

/**
 * Fire-and-forget embedding generation
 * Call this after creating/updating a mini-prompt
 */
export function triggerMiniPromptEmbedding(miniPromptId: string): void {
  // Run asynchronously without awaiting
  generateMiniPromptEmbedding(miniPromptId).catch((error) => {
    console.error("Background embedding generation failed:", error);
  });
}
