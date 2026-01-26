import { put, del } from '@vercel/blob';
import { prisma } from '@/server/db/client';

export interface SkillAttachmentData {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  blobUrl: string;
  createdAt: Date;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB per skill

/**
 * Upload a file attachment for a skill.
 * Caller is responsible for verifying ownership before calling this.
 */
export async function uploadSkillAttachment(
  skillId: string,
  file: File
): Promise<{ success: boolean; data?: SkillAttachmentData; error?: string }> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    }

    // Check total attachments size doesn't exceed limit
    const existingAttachments = await prisma.skillAttachment.findMany({
      where: { skillId },
      select: { fileSize: true },
    });

    const currentTotalSize = existingAttachments.reduce((sum, a) => sum + a.fileSize, 0);
    if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
      return { success: false, error: `Total attachments size would exceed maximum of ${MAX_TOTAL_SIZE / 1024 / 1024}MB` };
    }

    // Upload to Vercel Blob
    const blob = await put(`skills/${skillId}/${file.name}`, file, {
      access: 'public',
    });

    // Create database record
    const attachment = await prisma.skillAttachment.create({
      data: {
        skillId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        blobUrl: blob.url,
      },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        blobUrl: true,
        createdAt: true,
      },
    });

    return { success: true, data: attachment };
  } catch (error) {
    console.error('Error uploading skill attachment:', error);
    return { success: false, error: 'Failed to upload attachment' };
  }
}

/**
 * Delete a skill attachment by ID.
 * Caller is responsible for verifying ownership before calling this.
 */
export async function deleteSkillAttachment(
  attachmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const attachment = await prisma.skillAttachment.findUnique({
      where: { id: attachmentId },
      select: { blobUrl: true },
    });

    if (!attachment) {
      return { success: false, error: 'Attachment not found' };
    }

    // Delete from Vercel Blob
    await del(attachment.blobUrl);

    // Delete database record
    await prisma.skillAttachment.delete({
      where: { id: attachmentId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting skill attachment:', error);
    return { success: false, error: 'Failed to delete attachment' };
  }
}
