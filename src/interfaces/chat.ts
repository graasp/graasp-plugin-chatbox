import { ChatMessage } from './chat-message';

export interface Chat {
  id: string;
  messages: Array<ChatMessage>;
}
