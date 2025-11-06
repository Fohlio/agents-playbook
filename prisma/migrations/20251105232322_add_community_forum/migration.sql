-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "author_id" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_first_message" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_votes" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "topics_author_id_idx" ON "topics"("author_id");

-- CreateIndex
CREATE INDEX "topics_is_pinned_created_at_idx" ON "topics"("is_pinned", "created_at");

-- CreateIndex
CREATE INDEX "topics_created_at_idx" ON "topics"("created_at");

-- CreateIndex
CREATE INDEX "messages_topic_id_created_at_idx" ON "messages"("topic_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_author_id_idx" ON "messages"("author_id");

-- CreateIndex
CREATE INDEX "message_votes_message_id_idx" ON "message_votes"("message_id");

-- CreateIndex
CREATE INDEX "message_votes_user_id_idx" ON "message_votes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_votes_message_id_user_id_key" ON "message_votes"("message_id", "user_id");

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_votes" ADD CONSTRAINT "message_votes_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_votes" ADD CONSTRAINT "message_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
