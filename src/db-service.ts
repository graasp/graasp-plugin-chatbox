import { DatabaseTransactionConnectionType as TrxHandler, sql } from 'slonik';
import { ChatMessage } from './interfaces/chat-message';

export class ChatService {
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
            SELECT * FROM chat_message
            WHERE chat_id = ${chatId}
            ORDER BY created_at ASC
        `,
      )
      .then(({ rows }) => rows.slice(0));
  }

  /**
   * Adds a message to the given chat
   * @param chat Chat
   * @param message Message
   */
  async publishMessage(message: ChatMessage, transactionHandler: TrxHandler) {
    const { chatId, creator, createdAt, body } = message;
    return transactionHandler.query<ChatMessage>(sql`
            INSERT INTO chat_message (chat_id, creator, created_at, body)
            VALUES (${chatId}, ${creator}, ${createdAt}, ${body})
        `);
  }
}
