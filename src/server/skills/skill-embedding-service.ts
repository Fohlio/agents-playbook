import OpenAI from "openai";
import { prisma } from "@/server/db/client";

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
 * Generate and store embedding for a skill
 * This is designed to be fire-and-forget to avoid blocking the UI
 */
export async function generateSkillEmbedding(skillId: string): Promise<void> {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      console.warn("OpenAI API key not configured, skipping embedding generation");
      return;
    }

    // Fetch skill with tags and attachments
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
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
        },
        attachments: {
          select: {
            fileName: true
          }
        }
      },
    });

    if (!skill) {
      console.warn(`Skill ${skillId} not found`);
      return;
    }

    // Build searchable text from name, description, content (first 2000 chars), tag names, and attachment file names
    const tagNames = skill.tags?.map(st => st.tag.name) || [];
    const attachmentNames = skill.attachments?.map(a => a.fileName) || [];
    const searchText = [
      skill.name,
      skill.description || "",
      (skill.content || "").substring(0, 2000),
      ...tagNames,
      ...attachmentNames
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
    await prisma.skillEmbedding.upsert({
      where: { skillId },
      create: {
        skillId,
        embedding,
        searchText,
      },
      update: {
        embedding,
        searchText,
      },
    });

    console.log(`Generated embedding for skill: ${skill.name}`);
  } catch (error) {
    console.error(`Failed to generate embedding for skill ${skillId}:`, error);
  }
}

/**
 * Fire-and-forget embedding generation
 * Call this after creating/updating a skill
 */
export function triggerSkillEmbedding(skillId: string): void {
  // Run asynchronously without awaiting
  generateSkillEmbedding(skillId).catch((error) => {
    console.error("Background embedding generation failed:", error);
  });
}
