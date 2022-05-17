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

-- test that the migration worked
-- created_at and updated_at should be the same for new messages
/*
insert into chat_message (chat_id, creator, body)
values ('6261206b-5d68-41fe-9e56-fd311526936a',
        '598db6fb-de8d-4ace-aae5-8c864b3378ec',
        'message')
*/
