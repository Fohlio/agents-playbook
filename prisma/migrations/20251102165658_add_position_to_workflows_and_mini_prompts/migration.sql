-- AlterTable
ALTER TABLE "mini_prompts" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- Set positions based on created_at (oldest = 0) for workflows
WITH numbered_workflows AS (
  SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS pos
  FROM workflows
)
UPDATE workflows w
SET position = nw.pos
FROM numbered_workflows nw
WHERE w.id = nw.id;

-- Set positions based on created_at (oldest = 0) for mini_prompts
WITH numbered_prompts AS (
  SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS pos
  FROM mini_prompts
)
UPDATE mini_prompts mp
SET position = np.pos
FROM numbered_prompts np
WHERE mp.id = np.id;

-- CreateIndex
CREATE INDEX "mini_prompts_user_id_position_idx" ON "mini_prompts"("user_id", "position");

-- CreateIndex
CREATE INDEX "workflows_user_id_position_idx" ON "workflows"("user_id", "position");
