import { DatabaseTransactionConnectionType as TrxHandler, sql } from 'slonik';
import { ChatMessage } from './interfaces/chat-message';

export class ChatService {
  // the 'safe' way to dynamically generate the columns names:
  private static allColumns = sql.join(
    [
      ['chat_id', 'chatId'],
      'creator',
      ['created_at', 'createdAt'],
      'body',
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

  /**
   * Retrieves all the messages of the given chat
   * @param chatId Id of chat to retrieve
   */
  async get(
    chatId: string,
    transactionHandler: TrxHandler,
  ): Promise<ChatMessage[]> {
    return transactionHandler
      .query<ChatMessage>(
        sql`
            SELECT ${ChatService.allColumns} FROM chat_message
            WHERE chat_id = ${chatId}
            ORDER BY created_at ASC
        `,
      )
      .then(({ rows }) => rows.slice(0));
  }

  /**
   * Adds a message to the given chat
   * @param message Message
   */
  async publishMessage(message: Partial<ChatMessage>, transactionHandler: TrxHandler): Promise<ChatMessage> {
    const { chatId, creator, body } = message;
    return transactionHandler
      .query<ChatMessage>(
        sql`
            INSERT INTO chat_message (chat_id, creator, body)
            VALUES (${chatId}, ${creator}, ${body})
            RETURNING ${ChatService.allColumns}
        `,
      )
      .then(({ rows }) => rows[0]);
  }
}
