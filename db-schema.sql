CREATE TABLE "chat_message" (
    "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,                   -- id of chat message
    "chat_id" uuid REFERENCES "item" ("id") ON DELETE CASCADE,          -- id of item to which chat is attached
    "creator" uuid REFERENCES "member" ("id") ON DELETE SET NULL,       -- sender member
    "created_at" timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    "updated_at" timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'), -- same as created_at by default, changed by trigger on UPDATE
    "body" character varying(500)
);

CREATE INDEX ON "chat_message" ("chat_id");         -- optimize lookup by item id

CREATE INDEX ON "chat_message" ("id", "chat_id");   -- optimize lookup for message id and chat id

CREATE INDEX ON "chat_message" ("created_at");      -- optimize order by datetime

CREATE TRIGGER "chat_message_set_timestamp"
    BEFORE UPDATE ON "chat_message"
    FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();          -- already exists in database
