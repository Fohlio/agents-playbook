-- Add key column to workflows table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'workflows' AND column_name = 'key'
    ) THEN
        ALTER TABLE "workflows" ADD COLUMN "key" VARCHAR(100);
    END IF;
END $$;

-- Add index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'workflows' AND indexname = 'workflows_key_idx'
    ) THEN
        CREATE INDEX "workflows_key_idx" ON "workflows"("key");
    END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'workflows_key_key' AND conrelid = 'workflows'::regclass
    ) THEN
        ALTER TABLE "workflows" ADD CONSTRAINT "workflows_key_key" UNIQUE ("key");
    END IF;
END $$;
