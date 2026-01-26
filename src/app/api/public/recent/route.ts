import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

/**
 * GET /api/public/recent
 *
 * Returns the 10 most recent public workflows and 10 most recent public skills.
 * This endpoint is used on the landing page and requires no authentication.
 */
export async function GET() {
  try {
    const [workflows, skills] = await Promise.all([
      prisma.workflow.findMany({
        where: {
          visibility: "PUBLIC",
          isActive: true,
          deletedAt: null,
        },
        include: {
          user: {
            select: { id: true, username: true },
          },
          stages: {
            select: { id: true },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          models: {
            include: {
              model: true,
            },
          },
          _count: {
            select: {
              stages: true,
              references: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
      prisma.skill.findMany({
        where: {
          visibility: "PUBLIC",
          isActive: true,
          deletedAt: null,
        },
        include: {
          user: {
            select: { id: true, username: true },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          models: {
            include: {
              model: true,
            },
          },
          _count: {
            select: {
              attachments: true,
              references: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      workflows,
      skills,
    });
  } catch (error) {
    console.error("[GET /api/public/recent] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent items" },
      { status: 500 }
    );
  }
}
