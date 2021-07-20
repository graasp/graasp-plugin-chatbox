import { Actor, Task } from 'graasp';
import { Chat } from './chat';
import { ChatMessage } from './chat-message';

export interface ChatTaskManager<A extends Actor = Actor> {
  getGetChatTaskname(): string;

  getPublishMessageTaskName(): string;

  createGetTask(actor: A, objectId: string): Task<A, Chat>;

  createPublishMessageTask(
    actor: A,
    chatId: string,
    message: ChatMessage,
  ): Task<A, ChatMessage>;
}
