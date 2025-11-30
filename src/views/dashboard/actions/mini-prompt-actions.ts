"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/client";

export async function deleteMiniPrompt(miniPromptId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if used in workflows
  const usageCount = await prisma.stageMiniPrompt.count({
    where: { miniPromptId },
  });

  if (usageCount > 0) {
    throw new Error("Cannot delete mini-prompt that is used in workflows");
  }

  await prisma.miniPrompt.deleteMany({
    where: { id: miniPromptId, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function activateMiniPrompt(miniPromptId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const miniPrompt = await prisma.miniPrompt.findFirst({
    where: { id: miniPromptId, userId: session.user.id },
  });

  if (!miniPrompt) {
    throw new Error("Mini-prompt not found");
  }

  await prisma.miniPrompt.update({
    where: { id: miniPromptId },
    data: { isActive: true },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deactivateMiniPrompt(miniPromptId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.miniPrompt.updateMany({
    where: { id: miniPromptId, userId: session.user.id },
    data: { isActive: false },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleMiniPromptVisibility(miniPromptId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const miniPrompt = await prisma.miniPrompt.findFirst({
    where: { id: miniPromptId, userId: session.user.id },
  });

  if (!miniPrompt) {
    throw new Error("Mini-prompt not found");
  }

  await prisma.miniPrompt.update({
    where: { id: miniPromptId },
    data: { visibility: miniPrompt.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC" },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
