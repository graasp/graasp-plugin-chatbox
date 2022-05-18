/*
 This migration changes how created_at and updated_at columns are set.
 Before, updated_at had a default value of NULL, now it will have the
 same value as createdAt.
 */

-- remove trigger
DROP TRIGGER chat_message_set_timestamp ON chat_message;

-- remove
alter table chat_message drop updated_at;

-- re-create the updated_at column
ALTER TABLE chat_message
    ADD COLUMN updated_at timestamp NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc');

-- set the value of updated_at for all rows -> this will loose any modification information
UPDATE chat_message
set updated_at = created_at;

-- re-add the trigger to update the updated_at on UPDATE statements
CREATE TRIGGER "chat_message_set_timestamp"
    BEFORE UPDATE
    ON "chat_message"
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();
