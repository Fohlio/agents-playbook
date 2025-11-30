"use server";

import { z } from "zod";
import { prisma } from "@/server/db/client";
import type { UserSearchResult } from "../types";

// Validation schema
const searchQuerySchema = z.string().min(1).max(50);

// Search users for mentions
export async function searchUsers(query: string): Promise<{
  users: UserSearchResult[];
}> {
  try {
    // Validate query
    const validation = searchQuerySchema.safeParse(query);
    if (!validation.success) {
      return { users: [] };
    }

    const validQuery = validation.data.trim();

    if (!validQuery) {
      return { users: [] };
    }

    // Search users by username (case-insensitive)
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: validQuery,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
      },
      orderBy: {
        username: "asc",
      },
      take: 10, // Limit to 10 results for autocomplete
    });

    return { users };
  } catch (error) {
    console.error("Error searching users:", error);
    return { users: [] };
  }
}
