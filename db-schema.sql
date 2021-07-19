CREATE TABLE "chat_message" (
    "chat_id" uuid REFERENCES "item" ("id") ON DELETE CASCADE,          -- id of item to which chat is attached
    "creator" uuid REFERENCES "member" ("id") ON DELETE SET NULL,       -- sender member
    "created_at" timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    "body" character varying(500)
);