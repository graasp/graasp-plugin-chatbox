/**
 * Shape of chat messages
 */
export interface ChatMessage {
  id: string;
  chatId: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  body: string;
}
