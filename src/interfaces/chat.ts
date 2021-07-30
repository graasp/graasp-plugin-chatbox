import { ChatMessage } from './chat-message';

/**
 * Shape of entire chats
 */
export interface Chat {
  id: string;
  messages: Array<ChatMessage>;
}
