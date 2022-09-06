import { Member, Task } from '@graasp/sdk';

import { MemberChatMentions } from './chat-mention';

/**
 * Task manager for chat operations
 */
export interface ChatMentionsTaskManager<A extends Member = Member> {
  /**
   * Returns the name of the create mention task (write)
   */
  getCreateMentionsTaskName(): string;

  /**
   * Returns the name of the get mentions task (read)
   */
  getGetMemberMentionsTaskName(): string;

  /**
   * Returns the name of the update mention status task (write)
   */
  getUpdateMentionStatusTaskName(): string;

  /**
   * Returns the name of the delete mention task (write)
   */
  getDeleteMentionTaskName(): string;

  /**
   * Returns the name of the clear all mentions task (write)
   */
  getClearAllMentionsTaskName(): string;

  /**
   * Factory for a task to get all mentions for a member
   * @param actor User performing the action
   */
  createGetMemberMentionsTask(actor: A): Task<A, MemberChatMentions>;

  /**
   * Factory for a task to update a mention
   * @param actor User performing the action
   * @param mentionId mention ID
   * @param status status to update
   */
  createPatchMentionTaskSequence(
    actor: A,
    mentionId: string,
    status: string,
  ): Task<A, unknown>[];

  /**
   * Factory for a task to update a message in a chat
   * @param actor User performing the action
   * @param mentionId Mention ID
   */
  createDeleteMentionTaskSequence(
    actor: A,
    mentionId: string,
  ): Task<A, unknown>[];

  /**
   * Factory for a task to delete all mentions of a member
   * @param actor User performing the action
   */
  createClearAllMentionsTaskSingle(actor: A): Task<A, unknown>;
}
