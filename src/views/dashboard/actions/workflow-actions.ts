"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/client";

export async function activateWorkflow(workflowId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify ownership
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId: session.user.id },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  await prisma.workflow.update({
    where: { id: workflowId },
    data: { isActive: true },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deactivateWorkflow(workflowId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.workflow.updateMany({
    where: { id: workflowId, userId: session.user.id },
    data: { isActive: false },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteWorkflow(workflowId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.workflow.deleteMany({
    where: { id: workflowId, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleWorkflowVisibility(workflowId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId: session.user.id },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  await prisma.workflow.update({
    where: { id: workflowId },
    data: { visibility: workflow.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC" },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
