/*
  Warnings:

  - Added the required column `created_by` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add columns with temporary defaults
ALTER TABLE "tags" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "tags" ADD COLUMN "created_by" TEXT;

-- Step 2: Set existing tags to system user (bdad5da2-3cc9-4795-b918-063ff1222e7b)
UPDATE "tags" SET "created_by" = 'bdad5da2-3cc9-4795-b918-063ff1222e7b' WHERE "created_by" IS NULL;

-- Step 3: Make created_by NOT NULL
ALTER TABLE "tags" ALTER COLUMN "created_by" SET NOT NULL;

-- CreateIndex
CREATE INDEX "tags_is_active_idx" ON "tags"("is_active");

-- CreateIndex
CREATE INDEX "tags_created_by_idx" ON "tags"("created_by");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
