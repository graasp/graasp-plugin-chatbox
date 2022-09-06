import { Actor, Task } from '@graasp/sdk';

import { Chat } from './chat';
import { MessageBodyType } from './chat-message';

/**
 * Task manager for chat operations
 */
export interface ChatTaskManager<A extends Actor = Actor> {
  /**
   * Returns the name of the get chat task (read)
   */
  getGetChatTaskName(): string;

  /**
   * Returns the name of the publish message in chat task (write)
   */
  getPublishMessageTaskName(): string;

  /**
   * Returns the name of the patch message in chat task (write)
   */
  getPatchMessageTaskName(): string;

  /**
   * Returns the name of the delete message in chat task (write)
   */
  getDeleteMessageTaskName(): string;

  /**
   * Returns the name of the clear chat task (write)
   */
  getClearChatTaskName(): string;

  /**
   * Factory for a task to get a chat
   * @param actor User performing the action
   * @param objectId Chat ID
   */
  createGetTask(actor: A, objectId: string): Task<A, Chat>;

  createGetTaskSequence(actor: A, objectId: string): Task<A, unknown>[];

  /**
   * Factory for a task to publish a message in a chat
   * @param actor User performing the action
   * @param chatId Chat ID
   * @param chatBody ChatMessage to add
   */
  createPublishMessageTaskSequence(
    actor: A,
    chatId: string,
    chatBody: MessageBodyType,
  ): Task<A, unknown>[];

  /**
   * Factory for a task to update a message in a chat
   * @param actor User performing the action
   * @param chatId Chat ID
   * @param messageId Message ID
   * @param chatBody ChatMessage to update
   */
  createPatchMessageTaskSequence(
    actor: A,
    chatId: string,
    messageId: string,
    chatBody: MessageBodyType,
  ): Task<A, unknown>[];

  /**
   * Factory for a task to delete a message in a chat
   * @param actor User performing the action
   * @param chatId Chat ID
   * @param messageId Message ID to delete
   */
  createRemoveMessageTaskSequence(
    actor: A,
    chatId: string,
    messageId: string,
  ): Task<A, unknown>[];

  /**
   * Factory for a task to clear a chat
   * @param actor User performing the action
   * @param chatId Chat ID
   */
  createClearChatTaskSequence(actor: A, chatId: string): Task<A, unknown>[];
}
