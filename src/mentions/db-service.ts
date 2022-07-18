import { DatabaseTransactionConnection as TrxHandler, sql } from 'slonik';
import { ChatMention } from './interfaces/chat-mention';

/**
 * Database layer for chat storage
 */
export class MentionService {
  // the 'safe' way to dynamically generate the columns names:
  private static allColumns = sql.join(
    [
      'id',
      ['message_id', 'messageId'],
      ['member_id', 'memberId'],
      'creator',
      ['created_at', 'createdAt'],
      ['updated_at', 'updatedAt'],
      'status',
    ].map((c) =>
      !Array.isArray(c)
        ? sql.identifier([c])
        : sql.join(
            c.map((cwa) => sql.identifier([cwa])),
            sql` AS `,
          ),
    ),
    sql`, `,
  );

  private static tableName = sql`chat_mentions`;

  /**
   * Retrieves all the mentions for the given memberId
   * @param memberId Id of the member to retrieve
   * @param transactionHandler database handler
   */
  async getAll(
    memberId: string,
    transactionHandler: TrxHandler,
  ): Promise<ChatMention[]> {
    return transactionHandler
      .query<ChatMention>(
        sql`
            SELECT ${MentionService.allColumns}
            FROM ${MentionService.tableName}
            WHERE member_id = ${memberId}
            ORDER BY created_at ASC
        `,
      )
      .then(({ rows }) => rows.slice(0));
  }

  /**
   * Retrieves a mention given the mention id
   * @param mentionId Id of the mention to retrieve
   * @param transactionHandler database handler
   */
  async getMention(
    mentionId: string,
    transactionHandler: TrxHandler,
  ): Promise<ChatMention> {
    return transactionHandler
      .query<ChatMention>(
        sql`
            SELECT ${MentionService.allColumns}
            FROM ${MentionService.tableName}
            WHERE id = ${mentionId}
        `,
      )
      .then(({ rows }) => rows[0]);
  }

  /**
   * Adds mentions for the chat message
   * @param mentions Array of memberIds that are mentioned
   * @param messageId id of the chat message where the mention occurs
   * @param creator user creating the message and creating the mentions
   * @param transactionHandler database handler
   */
  async createMentions(
    mentions: string[],
    messageId: string,
    creator: string,
    transactionHandler: TrxHandler,
  ): Promise<ChatMention[]> {
    return transactionHandler
      .query<ChatMention>(
        sql`
            INSERT INTO ${
              MentionService.tableName
            } (message_id, creator, member_id)
            VALUES ${sql.join(
              mentions.map(
                (memberId) => sql`(${messageId}, ${creator}, ${memberId})`,
              ),
              sql`, `,
            )}
                RETURNING ${MentionService.allColumns}
        `,
      )
      .then(({ rows }) => rows.slice(0));
  }

  /**
   * Edit the status of a mention
   * @param mentionId Mention id to be updated
   * @param status new status to be set
   * @param transactionHandler database handler
   */
  async patchMention(
    mentionId: string,
    status: string,
    transactionHandler: TrxHandler,
  ): Promise<ChatMention> {
    return transactionHandler
      .query<ChatMention>(
        sql`
            UPDATE ${MentionService.tableName}
            SET status = ${status}
            WHERE id = ${mentionId}
               RETURNING ${MentionService.allColumns};
        `,
      )
      .then(({ rows }) => rows[0]);
  }

  /**
   * Remove a mention
   * @param mentionId Id of chat
   * @param transactionHandler database handler
   */
  async deleteMention(
    mentionId: string,
    transactionHandler: TrxHandler,
  ): Promise<ChatMention> {
    return transactionHandler
      .query<ChatMention>(
        sql`
            DELETE
            FROM ${MentionService.tableName}
            WHERE id = ${mentionId}
               RETURNING ${MentionService.allColumns}
        `,
      )
      .then(({ rows }) => rows[0]);
  }

  /**
   * Remove all mentions for the given memberId
   * @param memberId Id of the member
   * @param transactionHandler database handler
   */
  async clearAllMentions(
    memberId: string,
    transactionHandler: TrxHandler,
  ): Promise<ChatMention[]> {
    return transactionHandler
      .query<ChatMention>(
        sql`
            DELETE
            FROM ${MentionService.tableName}
            WHERE member_id = ${memberId} RETURNING ${MentionService.allColumns}
        `,
      )
      .then(({ rows }) => rows.slice(0));
  }
}
