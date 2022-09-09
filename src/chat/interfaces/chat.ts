import { ChatMessage, ExportedChatMessage } from './chat-message';

/**
 * Shape of entire chats
 */
export interface Chat {
  id: string;
  messages: Array<ChatMessage>;
}

/**
 * Shape of exported chats
 */
export interface ExportedChat {
  id: string;
  messages: Array<ExportedChatMessage>;
}
