-- CreateTable
CREATE TABLE "shared_links" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_type" "TargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "share_token" VARCHAR(32) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_links_share_token_key" ON "shared_links"("share_token");

-- CreateIndex
CREATE INDEX "shared_links_user_id_idx" ON "shared_links"("user_id");

-- CreateIndex
CREATE INDEX "shared_links_target_type_target_id_idx" ON "shared_links"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "shared_links_share_token_idx" ON "shared_links"("share_token");

-- CreateIndex
CREATE INDEX "shared_links_is_active_idx" ON "shared_links"("is_active");

-- CreateIndex
CREATE INDEX "shared_links_expires_at_idx" ON "shared_links"("expires_at");

-- AddForeignKey
ALTER TABLE "shared_links" ADD CONSTRAINT "shared_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
