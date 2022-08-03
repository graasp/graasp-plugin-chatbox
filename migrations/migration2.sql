/*
 This migration adds the chat mentions table with its triggers.
 */

CREATE TYPE mention_status AS ENUM ('unread', 'read');

CREATE TABLE "chat_mention"
(
    "id"         uuid UNIQUE    NOT NULL DEFAULT uuid_generate_v4(),
    "item_path"  ltree REFERENCES "item" ("path") ON DELETE CASCADE,          -- delete row if item is deleted
    "message_id" uuid REFERENCES "chat_message" ("id") ON DELETE CASCADE,      -- delete row if member is deleted
    "member_id"  uuid REFERENCES "member" ("id") ON DELETE CASCADE,            -- delete row if member is deleted
    "creator"    uuid           REFERENCES "member" ("id") ON DELETE SET NULL, -- don't remove - set creator to NULL
    "created_at" timestamp      NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    "updated_at" timestamp      NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    "status"     mention_status NOT NULL DEFAULT 'unread',
    PRIMARY KEY ("id")
);

CREATE INDEX ON "chat_mention" ("member_id"); -- optimize lookup by member_id

-- add the trigger to update the updated_at on UPDATE statements
CREATE TRIGGER "chat_mention_set_timestamp"
    BEFORE UPDATE
    ON "chat_mention"
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();