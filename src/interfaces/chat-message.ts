/**
 * Shape of chat messages
 */
export interface ChatMessage {
  chatId: string;
  creator: string;
  createdAt: string;
  body: string;
}
