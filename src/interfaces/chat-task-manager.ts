import { Actor, Task } from 'graasp';
import { Chat } from './chat';
import { ChatMessage } from './chat-message';

/**
 * Task manager for chat operations
 */
export interface ChatTaskManager<A extends Actor = Actor> {
  /**
   * Returns the name of the get chat task (read)
   */
  getGetChatTaskname(): string;

  /**
   * Returns the name of the publish message in chat task (write)
   */
  getPublishMessageTaskName(): string;

  /**
   * Returns the name of the delete message in chat task (write)
   */
  getDeleteMessageTaskName(): string;

  /**
   * Factory for a task to get a chat
   * @param actor User performing the action
   * @param objectId Chat ID
   */
  createGetTask(actor: A, objectId: string): Task<A, Chat>;

  createGetTaskSequence(actor: A, objectId: string): Task<Actor, unknown>[];

  /**
   * Factory for a task to publish a message in a chat
   * @param actor User performing the action
   * @param chatId Chat ID
   * @param message ChatMessage to add
   */
  createPublishMessageTaskSequence(
    actor: A,
    chatId: string,
    message: ChatMessage,
  ): Task<A, unknown>[];
}
